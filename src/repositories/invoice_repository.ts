import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { firstRow } from "@/db/result";
import { invoices, payments } from "@/db/schema";
import { requireProfile, requireTenant } from "@/lib/auth";
import type {
  InvoiceCreateValues,
  PaymentValues,
} from "@/schemas/invoices";
import type { Invoice, InvoiceWithDetails } from "@/types/database";

export const invoiceRepository = {
  async list(): Promise<Invoice[]> {
    const profile = await requireProfile();

    return db.query.invoices.findMany({
      where: eq(invoices.company_id, profile.company_id),
      orderBy: desc(invoices.created_at),
      limit: 200,
      with: { customers: true },
    });
  },

  async get(id: string): Promise<InvoiceWithDetails | null> {
    const profile = await requireProfile();

    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, id),
        eq(invoices.company_id, profile.company_id),
      ),
      with: {
        customers: true,
        payments: { orderBy: desc(payments.paid_at) },
        sales_orders: {
          with: {
            sales_order_lines: { with: { products: true } },
          },
        },
      },
    });

    return invoice ?? null;
  },

  async forOrder(orderId: string): Promise<Invoice | null> {
    const profile = await requireProfile();

    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.sales_order_id, orderId),
        eq(invoices.company_id, profile.company_id),
      ),
    });

    return invoice ?? null;
  },

  async createForOrder(values: InvoiceCreateValues): Promise<string> {
    const tenant = await requireTenant();

    const result = await db.execute(sql`
      select create_invoice_for_order(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${values.sales_order_id}::uuid,
        ${values.due_date}::timestamptz,
        ${values.note}
      ) as id
    `);

    const row = firstRow<{ id: string }>(result);
    if (!row) throw new Error("ORDER_NOT_FOUND");

    return row.id;
  },

  async recordPayment(values: PaymentValues): Promise<number> {
    const tenant = await requireTenant();

    const result = await db.execute(sql`
      select record_invoice_payment(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${values.invoice_id}::uuid,
        ${values.amount}::numeric,
        ${values.method},
        ${values.reference}
      ) as paid
    `);

    const row = firstRow<{ paid: string | number }>(result);
    if (!row) throw new Error("INVOICE_NOT_FOUND");

    return Number(row.paid);
  },

  async receivables(from?: Date, to?: Date): Promise<Invoice[]> {
    const profile = await requireProfile();

    const conditions = [eq(invoices.company_id, profile.company_id)];

    if (from) conditions.push(gte(invoices.issue_date, from));
    if (to) conditions.push(lte(invoices.issue_date, to));

    conditions.push(inArray(invoices.status, ["issued", "partial"]));

    return db.query.invoices.findMany({
      where: and(...conditions),
      orderBy: desc(invoices.issue_date),
      with: { customers: true },
    });
  },
};
