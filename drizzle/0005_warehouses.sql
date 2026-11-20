-- Multi-warehouse stock support.
-- Adds per-warehouse quantities while keeping products.stock_qty as the
-- aggregate used by dashboards and low-stock alerts.
-- Safe to re-run: all statements are idempotent.

-- ---------------------------------------------------------------------------
-- Backfill existing tenants with a default warehouse and their current stock
-- ---------------------------------------------------------------------------

insert into warehouses (company_id, name, code)
select c.id, 'Main Warehouse', 'MAIN'
from companies c
where not exists (
  select 1 from warehouses w
  where w.company_id = c.id and w.code = 'MAIN'
);

insert into product_stocks (company_id, product_id, warehouse_id, qty)
select p.company_id, p.id, w.id, p.stock_qty
from products p
join warehouses w on w.company_id = p.company_id and w.code = 'MAIN'
on conflict (product_id, warehouse_id) do nothing;

-- ---------------------------------------------------------------------------
-- Helpers and triggers that keep product_stocks in sync with new records
-- ---------------------------------------------------------------------------

create or replace function resolve_warehouse_id(
  p_company_id uuid,
  p_warehouse_id uuid
)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
begin
  if p_warehouse_id is not null then
    select id into v_id
    from warehouses
    where id = p_warehouse_id
      and company_id = p_company_id
      and is_active = true;

    if v_id is null then
      raise exception 'WAREHOUSE_NOT_FOUND' using errcode = '22023';
    end if;

    return v_id;
  end if;

  select id into v_id
  from warehouses
  where company_id = p_company_id and is_active = true and code = 'MAIN'
  limit 1;

  if v_id is null then
    select id into v_id
    from warehouses
    where company_id = p_company_id and is_active = true
    order by created_at
    limit 1;
  end if;

  if v_id is null then
    raise exception 'WAREHOUSE_NOT_FOUND' using errcode = '22023';
  end if;

  return v_id;
end;
$$;

create or replace function ensure_product_stock(
  p_company_id uuid,
  p_product_id uuid,
  p_warehouse_id uuid
)
returns void
language plpgsql
as $$
begin
  insert into product_stocks (company_id, product_id, warehouse_id, qty)
  values (p_company_id, p_product_id, p_warehouse_id, 0)
  on conflict (product_id, warehouse_id) do nothing;
end;
$$;

create or replace function handle_new_company()
returns trigger
language plpgsql
as $$
begin
  insert into warehouses (company_id, name, code)
  values (new.id, 'Main Warehouse', 'MAIN')
  on conflict (company_id, code) do nothing;
  return new;
end;
$$;

drop trigger if exists on_company_created on companies;
create trigger on_company_created
  after insert on companies
  for each row execute function handle_new_company();

create or replace function handle_new_product()
returns trigger
language plpgsql
as $$
begin
  insert into product_stocks (company_id, product_id, warehouse_id, qty)
  select new.company_id, new.id, w.id, 0
  from warehouses w
  where w.company_id = new.company_id and w.is_active = true
  on conflict (product_id, warehouse_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_product_created on products;
create trigger on_product_created
  after insert on products
  for each row execute function handle_new_product();

create or replace function handle_new_warehouse()
returns trigger
language plpgsql
as $$
begin
  insert into product_stocks (company_id, product_id, warehouse_id, qty)
  select new.company_id, p.id, new.id, 0
  from products p
  where p.company_id = new.company_id
  on conflict (product_id, warehouse_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_warehouse_created on warehouses;
create trigger on_warehouse_created
  after insert on warehouses
  for each row execute function handle_new_warehouse();

-- ---------------------------------------------------------------------------
-- Sales order — writes both the per-warehouse quantity and the aggregate
-- ---------------------------------------------------------------------------

create or replace function create_sales_order(
  p_company_id uuid,
  p_user_id text,
  p_customer_id uuid,
  p_branch_id uuid,
  p_lines jsonb,
  p_note text,
  p_warehouse_id uuid
)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_order_no text;
  v_warehouse_id uuid;
  v_line record;
  v_product products;
  v_stock numeric(14, 2);
  v_total numeric(14, 2) := 0;
  v_balance numeric(14, 2);
begin
  perform assert_company_member(p_company_id, p_user_id);
  v_warehouse_id := resolve_warehouse_id(p_company_id, p_warehouse_id);

  if p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'EMPTY_ORDER' using errcode = '22023';
  end if;

  if p_customer_id is not null and not exists (
    select 1 from customers
    where id = p_customer_id and company_id = p_company_id
  ) then
    raise exception 'CUSTOMER_NOT_FOUND' using errcode = '22023';
  end if;

  if p_branch_id is not null and not exists (
    select 1 from branches
    where id = p_branch_id and company_id = p_company_id
  ) then
    raise exception 'BRANCH_NOT_FOUND' using errcode = '22023';
  end if;

  v_order_no := 'SO-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into sales_orders
    (company_id, branch_id, customer_id, warehouse_id, order_no, status,
     total_amount, note, created_by)
  values
    (p_company_id, p_branch_id, p_customer_id, v_warehouse_id, v_order_no,
     'confirmed', 0, p_note, p_user_id)
  returning id into v_order_id;

  for v_line in
    select *
    from jsonb_to_recordset(p_lines) as x(product_id uuid, qty numeric, unit_price numeric)
  loop
    if v_line.qty is null or v_line.qty <= 0 then
      raise exception 'INVALID_QTY' using errcode = '22023';
    end if;

    select * into v_product
    from products
    where id = v_line.product_id and company_id = p_company_id
    for update;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND' using errcode = '22023';
    end if;

    perform ensure_product_stock(p_company_id, v_product.id, v_warehouse_id);

    select qty into v_stock
    from product_stocks
    where product_id = v_product.id and warehouse_id = v_warehouse_id
    for update;

    if v_stock < v_line.qty then
      raise exception 'INSUFFICIENT_STOCK:%', v_product.sku using errcode = '22023';
    end if;

    insert into sales_order_lines (order_id, product_id, qty, unit_price, line_total)
    values (
      v_order_id,
      v_product.id,
      v_line.qty,
      coalesce(v_line.unit_price, v_product.sell_price),
      v_line.qty * coalesce(v_line.unit_price, v_product.sell_price)
    );

    update product_stocks
    set qty = v_stock - v_line.qty, updated_at = now()
    where product_id = v_product.id and warehouse_id = v_warehouse_id;

    update products
    set stock_qty = stock_qty - v_line.qty
    where id = v_product.id
    returning stock_qty into v_balance;

    insert into stock_movements
      (company_id, product_id, warehouse_id, change_qty, balance_after,
       reason, reference_type, reference_id, created_by)
    values
      (p_company_id, v_product.id, v_warehouse_id, -v_line.qty, v_stock - v_line.qty,
       'Sales order ' || v_order_no, 'sales_order', v_order_id, p_user_id);

    v_total := v_total + v_line.qty * coalesce(v_line.unit_price, v_product.sell_price);
  end loop;

  update sales_orders set total_amount = v_total where id = v_order_id;

  return v_order_id;
end;
$$;

-- Backwards-compatible wrapper (uses the default warehouse).
create or replace function create_sales_order(
  p_company_id uuid,
  p_user_id text,
  p_customer_id uuid,
  p_branch_id uuid,
  p_lines jsonb,
  p_note text default null
)
returns uuid
language sql
as $$
  select create_sales_order(
    p_company_id, p_user_id, p_customer_id, p_branch_id, p_lines, p_note, null::uuid
  );
$$;

-- ---------------------------------------------------------------------------
-- Purchase order — stores the receiving warehouse
-- ---------------------------------------------------------------------------

create or replace function create_purchase_order(
  p_company_id uuid,
  p_user_id text,
  p_supplier_id uuid,
  p_branch_id uuid,
  p_lines jsonb,
  p_note text,
  p_warehouse_id uuid
)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_order_no text;
  v_warehouse_id uuid;
  v_line record;
  v_total numeric(14, 2) := 0;
begin
  perform assert_company_member(p_company_id, p_user_id);
  v_warehouse_id := resolve_warehouse_id(p_company_id, p_warehouse_id);

  if p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'EMPTY_ORDER' using errcode = '22023';
  end if;

  if p_supplier_id is not null and not exists (
    select 1 from suppliers
    where id = p_supplier_id and company_id = p_company_id
  ) then
    raise exception 'SUPPLIER_NOT_FOUND' using errcode = '22023';
  end if;

  if p_branch_id is not null and not exists (
    select 1 from branches
    where id = p_branch_id and company_id = p_company_id
  ) then
    raise exception 'BRANCH_NOT_FOUND' using errcode = '22023';
  end if;

  v_order_no := 'PO-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into purchase_orders
    (company_id, branch_id, supplier_id, warehouse_id, order_no, status,
     total_amount, note, created_by)
  values
    (p_company_id, p_branch_id, p_supplier_id, v_warehouse_id, v_order_no,
     'ordered', 0, p_note, p_user_id)
  returning id into v_order_id;

  for v_line in
    select *
    from jsonb_to_recordset(p_lines) as x(product_id uuid, qty numeric, unit_price numeric)
  loop
    if v_line.qty is null or v_line.qty <= 0 then
      raise exception 'INVALID_QTY' using errcode = '22023';
    end if;

    if not exists (
      select 1 from products
      where id = v_line.product_id and company_id = p_company_id
    ) then
      raise exception 'PRODUCT_NOT_FOUND' using errcode = '22023';
    end if;

    insert into purchase_order_lines (order_id, product_id, qty, unit_price, line_total)
    values (
      v_order_id,
      v_line.product_id,
      v_line.qty,
      coalesce(v_line.unit_price, 0),
      v_line.qty * coalesce(v_line.unit_price, 0)
    );

    v_total := v_total + v_line.qty * coalesce(v_line.unit_price, 0);
  end loop;

  update purchase_orders set total_amount = v_total where id = v_order_id;

  return v_order_id;
end;
$$;

create or replace function create_purchase_order(
  p_company_id uuid,
  p_user_id text,
  p_supplier_id uuid,
  p_branch_id uuid,
  p_lines jsonb,
  p_note text default null
)
returns uuid
language sql
as $$
  select create_purchase_order(
    p_company_id, p_user_id, p_supplier_id, p_branch_id, p_lines, p_note, null::uuid
  );
$$;

-- ---------------------------------------------------------------------------
-- Receiving goods updates the warehouse recorded on the purchase order
-- ---------------------------------------------------------------------------

create or replace function receive_purchase_order(
  p_company_id uuid,
  p_user_id text,
  p_order_id uuid
)
returns void
language plpgsql
as $$
declare
  v_order purchase_orders;
  v_warehouse_id uuid;
  v_line record;
  v_warehouse_balance numeric(14, 2);
  v_total_balance numeric(14, 2);
begin
  perform assert_company_member(p_company_id, p_user_id);

  select * into v_order
  from purchase_orders
  where id = p_order_id and company_id = p_company_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = '22023';
  end if;

  if v_order.status <> 'ordered' then
    raise exception 'ORDER_NOT_RECEIVABLE' using errcode = '22023';
  end if;

  v_warehouse_id := resolve_warehouse_id(p_company_id, v_order.warehouse_id);

  for v_line in
    select * from purchase_order_lines where order_id = p_order_id
  loop
    perform ensure_product_stock(p_company_id, v_line.product_id, v_warehouse_id);

    update product_stocks
    set qty = qty + v_line.qty, updated_at = now()
    where product_id = v_line.product_id and warehouse_id = v_warehouse_id
    returning qty into v_warehouse_balance;

    update products
    set stock_qty = stock_qty + v_line.qty
    where id = v_line.product_id
    returning stock_qty into v_total_balance;

    insert into stock_movements
      (company_id, product_id, warehouse_id, change_qty, balance_after,
       reason, reference_type, reference_id, created_by)
    values
      (p_company_id, v_line.product_id, v_warehouse_id, v_line.qty,
       v_warehouse_balance, 'Goods received ' || v_order.order_no,
       'purchase_order', v_order.id, p_user_id);
  end loop;

  update purchase_orders
  set status = 'received', received_at = now()
  where id = p_order_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Stock adjustment — per warehouse with aggregate kept in sync
-- ---------------------------------------------------------------------------

create or replace function adjust_stock(
  p_company_id uuid,
  p_user_id text,
  p_product_id uuid,
  p_change_qty numeric,
  p_reason text,
  p_warehouse_id uuid
)
returns numeric
language plpgsql
as $$
declare
  v_warehouse_id uuid;
  v_warehouse_balance numeric(14, 2);
  v_total_balance numeric(14, 2);
begin
  perform assert_company_member(p_company_id, p_user_id);
  v_warehouse_id := resolve_warehouse_id(p_company_id, p_warehouse_id);

  if p_change_qty is null or p_change_qty = 0 then
    raise exception 'INVALID_QTY' using errcode = '22023';
  end if;

  if not exists (
    select 1 from products
    where id = p_product_id and company_id = p_company_id
  ) then
    raise exception 'PRODUCT_NOT_FOUND' using errcode = '22023';
  end if;

  perform ensure_product_stock(p_company_id, p_product_id, v_warehouse_id);

  update product_stocks
  set qty = qty + p_change_qty, updated_at = now()
  where product_id = p_product_id and warehouse_id = v_warehouse_id
  returning qty into v_warehouse_balance;

  update products
  set stock_qty = stock_qty + p_change_qty
  where id = p_product_id
  returning stock_qty into v_total_balance;

  insert into stock_movements
    (company_id, product_id, warehouse_id, change_qty, balance_after,
     reason, reference_type, created_by)
  values
    (p_company_id, p_product_id, v_warehouse_id, p_change_qty,
     v_warehouse_balance, coalesce(p_reason, 'Stock adjustment'),
     'adjustment', p_user_id);

  return v_total_balance;
end;
$$;

create or replace function adjust_stock(
  p_company_id uuid,
  p_user_id text,
  p_product_id uuid,
  p_change_qty numeric,
  p_reason text default null
)
returns numeric
language sql
as $$
  select adjust_stock(
    p_company_id, p_user_id, p_product_id, p_change_qty, p_reason, null::uuid
  );
$$;
