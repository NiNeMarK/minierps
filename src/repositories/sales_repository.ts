import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { firstRow } from "@/db/result";
import { salesOrders } from "@/db/schema";
import { requireProfile, requireTenant } from "@/lib/auth";
import type { SalesOrderInput } from "@/schemas/master-data";
import type { SalesOrder, SalesOrderWithLines } from "@/types/database";

export const salesRepository = {
  async list(): Promise<SalesOrder[]> {
    const profile = await requireProfile();

    return db.query.salesOrders.findMany({
      where: eq(salesOrders.company_id, profile.company_id),
      orderBy: desc(salesOrders.created_at),
      limit: 100,
      with: { customers: true },
    });
  },

  async get(id: string): Promise<SalesOrderWithLines | null> {
    const profile = await requireProfile();

    const order = await db.query.salesOrders.findFirst({
      where: and(
        eq(salesOrders.id, id),
        eq(salesOrders.company_id, profile.company_id),
      ),
      with: {
        customers: true,
        sales_order_lines: { with: { products: true } },
      },
    });

    return order ?? null;
  },

  async create(values: SalesOrderInput): Promise<string> {
    const tenant = await requireTenant();

    const payload = JSON.stringify(
      values.lines.map((line) => ({
        product_id: line.product_id,
        qty: line.qty,
        unit_price: line.unit_price,
      })),
    );

    const result = await db.execute(sql`
      select create_sales_order(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${(values.customer_id as string | null) ?? null}::uuid,
        ${(values.branch_id as string | null) ?? null}::uuid,
        ${payload}::jsonb,
        ${(values.note as string | null) ?? null}
      ) as id
    `);

    const row = firstRow<{ id: string }>(result);
    if (!row) throw new Error("ORDER_NOT_FOUND");

    return row.id;
  },
};
