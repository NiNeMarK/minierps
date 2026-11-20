-- Invoices, payments and company user management.
-- Safe to re-run: constraints are dropped before being recreated and
-- functions use CREATE OR REPLACE.

-- ---------------------------------------------------------------------------
-- Constraints
-- ---------------------------------------------------------------------------

alter table "invoices" drop constraint if exists "invoices_status_check";
alter table "invoices" add constraint "invoices_status_check"
  check ("status" in ('draft', 'issued', 'partial', 'paid', 'cancelled'));

alter table "invoices" drop constraint if exists "invoices_amount_check";
alter table "invoices" add constraint "invoices_amount_check"
  check ("total_amount" >= 0 and "paid_amount" >= 0 and "paid_amount" <= "total_amount");

alter table "payments" drop constraint if exists "payments_method_check";
alter table "payments" add constraint "payments_method_check"
  check ("method" in ('cash', 'transfer', 'card', 'other'));

alter table "payments" drop constraint if exists "payments_amount_check";
alter table "payments" add constraint "payments_amount_check"
  check ("amount" > 0);

-- ---------------------------------------------------------------------------
-- Create one invoice for a confirmed sales order.
-- ---------------------------------------------------------------------------

create or replace function create_invoice_for_order(
  p_company_id uuid,
  p_user_id text,
  p_sales_order_id uuid,
  p_due_date timestamptz default null,
  p_note text default null
)
returns uuid
language plpgsql
as $$
declare
  v_order sales_orders;
  v_invoice_id uuid;
  v_invoice_no text;
begin
  perform assert_company_member(p_company_id, p_user_id);

  select * into v_order
  from sales_orders
  where id = p_sales_order_id and company_id = p_company_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND' using errcode = '22023';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'ORDER_NOT_INVOICEABLE' using errcode = '22023';
  end if;

  if exists (
    select 1 from invoices where sales_order_id = p_sales_order_id
  ) then
    raise exception 'INVOICE_EXISTS' using errcode = '23505';
  end if;

  v_invoice_no := 'INV-' || to_char(now(), 'YYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into invoices
    (company_id, sales_order_id, customer_id, invoice_no, status,
     issue_date, due_date, total_amount, note, created_by)
  values
    (p_company_id, v_order.id, v_order.customer_id, v_invoice_no, 'issued',
     now(), p_due_date, v_order.total_amount, p_note, p_user_id)
  returning id into v_invoice_id;

  return v_invoice_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Record a payment against an invoice and update its status atomically.
-- Returns the new paid amount.
-- ---------------------------------------------------------------------------

create or replace function record_invoice_payment(
  p_company_id uuid,
  p_user_id text,
  p_invoice_id uuid,
  p_amount numeric,
  p_method text default 'cash',
  p_reference text default null
)
returns numeric
language plpgsql
as $$
declare
  v_invoice invoices;
  v_paid numeric(14, 2);
begin
  perform assert_company_member(p_company_id, p_user_id);

  select * into v_invoice
  from invoices
  where id = p_invoice_id and company_id = p_company_id
  for update;

  if not found then
    raise exception 'INVOICE_NOT_FOUND' using errcode = '22023';
  end if;

  if v_invoice.status = 'cancelled' then
    raise exception 'INVOICE_CANCELLED' using errcode = '22023';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT' using errcode = '22023';
  end if;

  if p_method is null or p_method not in ('cash', 'transfer', 'card', 'other') then
    raise exception 'INVALID_PAYMENT_METHOD' using errcode = '22023';
  end if;

  if v_invoice.paid_amount + p_amount > v_invoice.total_amount then
    raise exception 'PAYMENT_EXCEEDS_BALANCE' using errcode = '22023';
  end if;

  insert into payments
    (company_id, invoice_id, amount, method, reference, paid_at, created_by)
  values
    (p_company_id, p_invoice_id, p_amount, p_method, p_reference, now(), p_user_id);

  v_paid := v_invoice.paid_amount + p_amount;

  update invoices
  set paid_amount = v_paid,
      status = case
        when v_paid >= total_amount then 'paid'
        else 'partial'
      end
  where id = p_invoice_id;

  return v_paid;
end;
$$;

-- ---------------------------------------------------------------------------
-- Invite a user into an existing company.
-- Better Auth's sign-up API signs the new user in, which would replace the
-- administrator's session, so the account is created directly. The signup
-- trigger first provisions a throwaway company for the new user; it is
-- removed after the profile is moved into the requesting company.
-- ---------------------------------------------------------------------------

create or replace function invite_company_user(
  p_company_id uuid,
  p_actor_id text,
  p_email text,
  p_name text,
  p_role text,
  p_password_hash text
)
returns text
language plpgsql
as $$
declare
  v_user_id text;
  v_temp_company uuid;
  v_email text;
  v_name text;
begin
  perform assert_company_member(p_company_id, p_actor_id);

  if p_role is null or p_role not in ('owner', 'admin', 'manager', 'staff') then
    raise exception 'INVALID_ROLE' using errcode = '22023';
  end if;

  v_email := lower(btrim(coalesce(p_email, '')));

  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'INVALID_EMAIL' using errcode = '22023';
  end if;

  if p_password_hash is null or length(p_password_hash) = 0 then
    raise exception 'INVALID_PASSWORD' using errcode = '22023';
  end if;

  if exists (select 1 from "user" where lower(email) = v_email) then
    raise exception 'EMAIL_IN_USE' using errcode = '23505';
  end if;

  v_name := coalesce(nullif(btrim(p_name), ''), split_part(v_email, '@', 1));
  v_user_id := replace(gen_random_uuid()::text, '-', '');

  insert into "user"
    (id, name, email, email_verified, created_at, updated_at)
  values
    (v_user_id, v_name, v_email, true, now(), now());

  select company_id into v_temp_company
  from profiles
  where id = v_user_id;

  insert into account
    (id, account_id, provider_id, user_id, password, created_at, updated_at)
  values
    (replace(gen_random_uuid()::text, '-', ''), v_user_id, 'credential',
     v_user_id, p_password_hash, now(), now());

  update profiles
  set company_id = p_company_id,
      role = p_role,
      full_name = v_name
  where id = v_user_id;

  if v_temp_company is not null and v_temp_company <> p_company_id then
    delete from companies where id = v_temp_company;
  end if;

  return v_user_id;
end;
$$;
