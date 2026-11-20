import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { firstRow } from "@/db/result";
import { purchaseOrders } from "@/db/schema";
import { requireProfile, requireTenant } from "@/lib/auth";
import type { PurchaseOrderInput } from "@/schemas/master-data";
import type {
  PurchaseOrder,
  PurchaseOrderWithLines,
} from "@/types/database";

export const purchaseRepository = {
  async list(): Promise<PurchaseOrder[]> {
    const profile = await requireProfile();

    return db.query.purchaseOrders.findMany({
      where: eq(purchaseOrders.company_id, profile.company_id),
      orderBy: desc(purchaseOrders.created_at),
      limit: 100,
      with: { suppliers: true },
    });
  },

  async get(id: string): Promise<PurchaseOrderWithLines | null> {
    const profile = await requireProfile();

    const order = await db.query.purchaseOrders.findFirst({
      where: and(
        eq(purchaseOrders.id, id),
        eq(purchaseOrders.company_id, profile.company_id),
      ),
      with: {
        suppliers: true,
        purchase_order_lines: { with: { products: true } },
      },
    });

    return order ?? null;
  },

  async create(values: PurchaseOrderInput): Promise<string> {
    const tenant = await requireTenant();

    const payload = JSON.stringify(
      values.lines.map((line) => ({
        product_id: line.product_id,
        qty: line.qty,
        unit_price: line.unit_price,
      })),
    );

    const result = await db.execute(sql`
      select create_purchase_order(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${(values.supplier_id as string | null) ?? null}::uuid,
        ${(values.branch_id as string | null) ?? null}::uuid,
        ${payload}::jsonb,
        ${(values.note as string | null) ?? null}
      ) as id
    `);

    const row = firstRow<{ id: string }>(result);
    if (!row) throw new Error("ORDER_NOT_FOUND");

    return row.id;
  },

  async receive(id: string): Promise<void> {
    const tenant = await requireTenant();

    await db.execute(sql`
      select receive_purchase_order(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${id}::uuid
      )
    `);
  },
};
