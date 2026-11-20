import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Better Auth tables
// Keys are camelCase because Better Auth maps fields by property name.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Tenant + master data
// Keys use snake_case to match the domain types used by the UI.
// ---------------------------------------------------------------------------

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Asia/Bangkok"),
  currency: text("currency").notNull().default("THB"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  company_id: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  full_name: text("full_name"),
  role: text("role")
    .$type<"owner" | "admin" | "manager" | "staff">()
    .notNull()
    .default("owner"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const branches = pgTable(
  "branches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: text("code"),
    address: text("address"),
    phone: text("phone"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_branches_company").on(table.company_id)],
);

export const warehouses = pgTable(
  "warehouses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    branch_id: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    code: text("code"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_warehouses_company").on(table.company_id)],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("categories_company_name_unique").on(table.company_id, table.name)],
);

export const units = pgTable(
  "units",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("units_company_name_unique").on(table.company_id, table.name)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    category_id: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    unit_id: uuid("unit_id").references(() => units.id, {
      onDelete: "set null",
    }),
    cost_price: numeric("cost_price", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    sell_price: numeric("sell_price", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    stock_qty: numeric("stock_qty", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    reorder_point: numeric("reorder_point", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("products_company_sku_unique").on(table.company_id, table.sku),
    index("idx_products_company").on(table.company_id),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact_name: text("contact_name"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_customers_company").on(table.company_id)],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact_name: text("contact_name"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_suppliers_company").on(table.company_id)],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    warehouse_id: uuid("warehouse_id").references(() => warehouses.id, {
      onDelete: "set null",
    }),
    change_qty: numeric("change_qty", {
      precision: 14,
      scale: 2,
      mode: "number",
    }).notNull(),
    balance_after: numeric("balance_after", {
      precision: 14,
      scale: 2,
      mode: "number",
    }).notNull(),
    reason: text("reason"),
    reference_type: text("reference_type").notNull().default("adjustment"),
    reference_id: uuid("reference_id"),
    created_by: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_stock_movements_product").on(
      table.company_id,
      table.product_id,
      table.created_at,
    ),
  ],
);

export const salesOrders = pgTable(
  "sales_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    branch_id: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    customer_id: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    order_no: text("order_no").notNull(),
    status: text("status")
      .$type<"draft" | "confirmed" | "cancelled">()
      .notNull()
      .default("confirmed"),
    total_amount: numeric("total_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    note: text("note"),
    created_by: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("sales_orders_company_no_unique").on(table.company_id, table.order_no),
    index("idx_sales_orders_company").on(table.company_id, table.created_at),
  ],
);

export const salesOrderLines = pgTable(
  "sales_order_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    order_id: uuid("order_id")
      .notNull()
      .references(() => salesOrders.id, { onDelete: "cascade" }),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    qty: numeric("qty", { precision: 14, scale: 2, mode: "number" }).notNull(),
    unit_price: numeric("unit_price", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    line_total: numeric("line_total", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_sales_lines_order").on(table.order_id)],
);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    branch_id: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    supplier_id: uuid("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    order_no: text("order_no").notNull(),
    status: text("status")
      .$type<"draft" | "ordered" | "received" | "cancelled">()
      .notNull()
      .default("ordered"),
    total_amount: numeric("total_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    note: text("note"),
    created_by: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    received_at: timestamp("received_at", { withTimezone: true }),
  },
  (table) => [
    unique("purchase_orders_company_no_unique").on(
      table.company_id,
      table.order_no,
    ),
    index("idx_purchase_orders_company").on(table.company_id, table.created_at),
  ],
);

export const purchaseOrderLines = pgTable(
  "purchase_order_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    order_id: uuid("order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),
    product_id: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    qty: numeric("qty", { precision: 14, scale: 2, mode: "number" }).notNull(),
    unit_price: numeric("unit_price", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    line_total: numeric("line_total", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("idx_purchase_lines_order").on(table.order_id)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    sales_order_id: uuid("sales_order_id").references(() => salesOrders.id, {
      onDelete: "set null",
    }),
    customer_id: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    invoice_no: text("invoice_no").notNull(),
    status: text("status")
      .$type<"draft" | "issued" | "partial" | "paid" | "cancelled">()
      .notNull()
      .default("issued"),
    issue_date: timestamp("issue_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    due_date: timestamp("due_date", { withTimezone: true }),
    total_amount: numeric("total_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    paid_amount: numeric("paid_amount", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .notNull()
      .default(0),
    note: text("note"),
    created_by: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("invoices_company_no_unique").on(table.company_id, table.invoice_no),
    unique("invoices_sales_order_unique").on(table.sales_order_id),
    index("idx_invoices_company").on(table.company_id, table.created_at),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    company_id: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    invoice_id: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 14, scale: 2, mode: "number" })
      .notNull(),
    method: text("method")
      .$type<"cash" | "transfer" | "card" | "other">()
      .notNull()
      .default("cash"),
    reference: text("reference"),
    paid_at: timestamp("paid_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_by: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_payments_invoice").on(table.invoice_id, table.paid_at),
  ],
);

// ---------------------------------------------------------------------------
// Relations — named to match the shapes the UI already consumes.
// ---------------------------------------------------------------------------

export const productsRelations = relations(products, ({ one }) => ({
  categories: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  units: one(units, {
    fields: [products.unit_id],
    references: [units.id],
  }),
}));

export const stockMovementsRelations = relations(
  stockMovements,
  ({ one }) => ({
    products: one(products, {
      fields: [stockMovements.product_id],
      references: [products.id],
    }),
  }),
);

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  customers: one(customers, {
    fields: [salesOrders.customer_id],
    references: [customers.id],
  }),
  sales_order_lines: many(salesOrderLines),
  invoices: one(invoices, {
    fields: [salesOrders.id],
    references: [invoices.sales_order_id],
  }),
}));

export const salesOrderLinesRelations = relations(
  salesOrderLines,
  ({ one }) => ({
    sales_orders: one(salesOrders, {
      fields: [salesOrderLines.order_id],
      references: [salesOrders.id],
    }),
    products: one(products, {
      fields: [salesOrderLines.product_id],
      references: [products.id],
    }),
  }),
);

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    suppliers: one(suppliers, {
      fields: [purchaseOrders.supplier_id],
      references: [suppliers.id],
    }),
    purchase_order_lines: many(purchaseOrderLines),
  }),
);

export const purchaseOrderLinesRelations = relations(
  purchaseOrderLines,
  ({ one }) => ({
    purchase_orders: one(purchaseOrders, {
      fields: [purchaseOrderLines.order_id],
      references: [purchaseOrders.id],
    }),
    products: one(products, {
      fields: [purchaseOrderLines.product_id],
      references: [products.id],
    }),
  }),
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customers: one(customers, {
    fields: [invoices.customer_id],
    references: [customers.id],
  }),
  sales_orders: one(salesOrders, {
    fields: [invoices.sales_order_id],
    references: [salesOrders.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoices: one(invoices, {
    fields: [payments.invoice_id],
    references: [invoices.id],
  }),
}));
