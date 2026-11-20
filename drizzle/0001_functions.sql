-- Business rules, stock ledger helpers and tenant provisioning.
-- These statements are safe to re-run against an existing database.

-- ---------------------------------------------------------------------------
-- Constraints that Drizzle cannot express directly
-- ---------------------------------------------------------------------------

alter table "profiles" drop constraint if exists "profiles_role_check";
alter table "profiles" add constraint "profiles_role_check"
  check ("role" in ('owner', 'admin', 'manager', 'staff'));

alter table "sales_orders" drop constraint if exists "sales_orders_status_check";
alter table "sales_orders" add constraint "sales_orders_status_check"
  check ("status" in ('draft', 'confirmed', 'cancelled'));

alter table "purchase_orders" drop constraint if exists "purchase_orders_status_check";
alter table "purchase_orders" add constraint "purchase_orders_status_check"
  check ("status" in ('draft', 'ordered', 'received', 'cancelled'));

alter table "sales_order_lines" drop constraint if exists "sales_order_lines_qty_check";
alter table "sales_order_lines" add constraint "sales_order_lines_qty_check"
  check ("qty" > 0);

alter table "purchase_order_lines" drop constraint if exists "purchase_order_lines_qty_check";
alter table "purchase_order_lines" add constraint "purchase_order_lines_qty_check"
  check ("qty" > 0);

-- ---------------------------------------------------------------------------
-- Tenant provisioning: called by trigger after Better Auth creates a user.
-- Idempotent so it can also be used as a lazy fallback.
-- ---------------------------------------------------------------------------

create or replace function provision_company_for_user(
  p_user_id text,
  p_full_name text
)
returns uuid
language plpgsql
as $$
declare
  v_company_id uuid;
  v_name text;
begin
  select company_id into v_company_id
  from profiles
  where id = p_user_id;

  if v_company_id is not null then
    return v_company_id;
  end if;

  v_name := coalesce(nullif(btrim(p_full_name), ''), 'ผู้ใช้งาน');

  insert into companies (name)
  values ('บริษัท ' || v_name)
  returning id into v_company_id;

  insert into profiles (id, company_id, full_name, role)
  values (p_user_id, v_company_id, p_full_name, 'owner')
  on conflict (id) do nothing;

  insert into units (company_id, name, symbol)
  values
    (v_company_id, 'Piece', 'pcs'),
    (v_company_id, 'Box', 'box'),
    (v_company_id, 'Kilogram', 'kg')
  on conflict (company_id, name) do nothing;

  insert into categories (company_id, name)
  values
    (v_company_id, 'General'),
    (v_company_id, 'Beverage'),
    (v_company_id, 'Snack')
  on conflict (company_id, name) do nothing;

  insert into branches (company_id, name, code)
  values (v_company_id, 'Head Office', 'HQ');

  return v_company_id;
end;
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
as $$
begin
  perform provision_company_for_user(new.id, new.name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on "user";
create trigger on_auth_user_created
  after insert on "user"
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function assert_company_member(
  p_company_id uuid,
  p_user_id text
)
returns void
language plpgsql
as $$
begin
  if p_company_id is null or p_user_id is null then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;

  if not exists (
    select 1 from profiles
    where id = p_user_id and company_id = p_company_id
  ) then
    raise exception 'NOT_AUTHENTICATED' using errcode = '42501';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Sales orders: validates stock and deducts it atomically.
-- ---------------------------------------------------------------------------

create or replace function create_sales_order(
  p_company_id uuid,
  p_user_id text,
  p_customer_id uuid,
  p_branch_id uuid,
  p_lines jsonb,
  p_note text default null
)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_order_no text;
  v_line record;
  v_product products;
  v_total numeric(14, 2) := 0;
  v_balance numeric(14, 2);
begin
  perform assert_company_member(p_company_id, p_user_id);

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
    (company_id, branch_id, customer_id, order_no, status, total_amount, note, created_by)
  values
    (p_company_id, p_branch_id, p_customer_id, v_order_no, 'confirmed', 0, p_note, p_user_id)
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

    if v_product.stock_qty < v_line.qty then
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

    v_balance := v_product.stock_qty - v_line.qty;

    update products
    set stock_qty = v_balance
    where id = v_product.id;

    insert into stock_movements
      (company_id, product_id, change_qty, balance_after, reason, reference_type, reference_id, created_by)
    values
      (p_company_id, v_product.id, -v_line.qty, v_balance,
       'Sales order ' || v_order_no, 'sales_order', v_order_id, p_user_id);

    v_total := v_total + v_line.qty * coalesce(v_line.unit_price, v_product.sell_price);
  end loop;

  update sales_orders set total_amount = v_total where id = v_order_id;

  return v_order_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Purchase orders
-- ---------------------------------------------------------------------------

create or replace function create_purchase_order(
  p_company_id uuid,
  p_user_id text,
  p_supplier_id uuid,
  p_branch_id uuid,
  p_lines jsonb,
  p_note text default null
)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_order_no text;
  v_line record;
  v_total numeric(14, 2) := 0;
begin
  perform assert_company_member(p_company_id, p_user_id);

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
    (company_id, branch_id, supplier_id, order_no, status, total_amount, note, created_by)
  values
    (p_company_id, p_branch_id, p_supplier_id, v_order_no, 'ordered', 0, p_note, p_user_id)
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
  v_line record;
  v_balance numeric(14, 2);
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

  for v_line in
    select * from purchase_order_lines where order_id = p_order_id
  loop
    update products
    set stock_qty = stock_qty + v_line.qty
    where id = v_line.product_id
    returning stock_qty into v_balance;

    insert into stock_movements
      (company_id, product_id, change_qty, balance_after, reason, reference_type, reference_id, created_by)
    values
      (p_company_id, v_line.product_id, v_line.qty, v_balance,
       'Goods received ' || v_order.order_no, 'purchase_order', v_order.id, p_user_id);
  end loop;

  update purchase_orders
  set status = 'received', received_at = now()
  where id = p_order_id;
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
language plpgsql
as $$
declare
  v_balance numeric(14, 2);
begin
  perform assert_company_member(p_company_id, p_user_id);

  if p_change_qty is null or p_change_qty = 0 then
    raise exception 'INVALID_QTY' using errcode = '22023';
  end if;

  update products
  set stock_qty = stock_qty + p_change_qty
  where id = p_product_id and company_id = p_company_id
  returning stock_qty into v_balance;

  if not found then
    raise exception 'PRODUCT_NOT_FOUND' using errcode = '22023';
  end if;

  insert into stock_movements
    (company_id, product_id, change_qty, balance_after, reason, reference_type, created_by)
  values
    (p_company_id, p_product_id, p_change_qty, v_balance,
     coalesce(p_reason, 'Stock adjustment'), 'adjustment', p_user_id);

  return v_balance;
end;
$$;
