# Database Design (Technical)

## 1. Stack & Principles

- **Primary DB:** Neon Postgres
- **ORM / migrations:** Drizzle ORM + Drizzle Kit
- **Auth storage:** Better Auth tables in the same Postgres database
- **Principles:** tenant isolation by `company_id`, auditable stock ledger,
  atomic stock/financial operations, soft archive for master data

## 2. Runtime data access

```
Server Component / Server Action
        ↓
requireProfile() / requireTenant()   (Better Auth session)
        ↓
repository (Drizzle query)
        ↓
Neon HTTP driver (@neondatabase/serverless)
```

There is **no RLS layer**. Every repository query includes
`eq(table.company_id, profile.company_id)`, and updates/deletes include the
same predicate. Server actions validate input with Zod and re-check the session
before touching data.

The Neon HTTP driver runs one statement per round-trip and does not support
interactive transactions, so multi-step business rules live in Postgres
functions:

| Function | Purpose |
| --- | --- |
| `create_sales_order` | validate stock, insert order/lines, deduct stock, write movements |
| `create_purchase_order` | insert purchase order and lines |
| `receive_purchase_order` | add stock, write movements, mark order received |
| `adjust_stock` | change stock and write a movement |
| `create_invoice_for_order` | create one invoice from a sales order |
| `record_invoice_payment` | add a payment and update invoice status |
| `invite_company_user` | create auth account + profile inside an existing tenant |
| `provision_company_for_user` | create company/profile/default reference data |
| `assert_company_member` | guard used by the functions above |

## 3. Core tables

### Auth (Better Auth)

- `user` — id (text), name, email (unique), email_verified, image, timestamps
- `session` — token (unique), user_id, expires_at, ip, user_agent
- `account` — provider credentials (password hash lives here)
- `verification` — email/reset tokens

### Tenant & master data

- `companies` — name, currency, timezone
- `profiles` — user_id (PK), company_id, full_name, role
- `branches`, `warehouses`, `categories`, `units`
- `products` — sku, prices, `stock_qty`, `reorder_point`, `is_active`
- `customers`, `suppliers`

### Transactions

- `sales_orders` / `sales_order_lines`
- `purchase_orders` / `purchase_order_lines`
- `invoices` / `payments` — one invoice per sales order, many payments per invoice
- `stock_movements` — signed `change_qty`, `balance_after`, reference type/id

Money and quantities use `numeric(14,2)`. Drizzle maps them to `number` with
`mode: "number"`.

## 4. Indexes

- `products (company_id)`, unique `(company_id, sku)`
- `customers (company_id)`, `suppliers (company_id)`
- `sales_orders (company_id, created_at)`, unique `(company_id, order_no)`
- `purchase_orders (company_id, created_at)`, unique `(company_id, order_no)`
- `stock_movements (company_id, product_id, created_at)`
- `session (user_id)`, `account (user_id)`

## 5. Migrations & seeds

```bash
npm run db:generate   # after editing src/db/schema.ts
npm run db:migrate    # apply pending SQL to Neon
npm run db:studio     # inspect data locally
```

Migration files live in `drizzle/`:

- `0000_init.sql` — generated tables, indexes, foreign keys
- `0001_functions.sql` — hand-written checks, trigger, and business functions

Signup seeds a company, owner profile, three units, three categories, and one
branch through the `on_auth_user_created` trigger. The application also has a
lazy fallback (`provision_company_for_user`) if the trigger is missing.

## 6. Backup & DR

- Neon provides point-in-time restore on paid plans; verify the retention window
- Keep `drizzle/` migrations in version control as the schema source of truth
- Test restore into a branch database before production changes
- Never hard-delete master data that documents reference; use `is_active`

## 7. Data model notes

- UUID primary keys for tenant data; Better Auth uses text IDs
- Monetary values stored as numeric, never floating point
- Stock history is append-only through `stock_movements`
- Deletion of a company requires removing dependent orders first because
  product references use `ON DELETE RESTRICT`
