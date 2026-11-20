import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { firstRow } from "@/db/result";
import { stockMovements } from "@/db/schema";
import { requireProfile, requireTenant } from "@/lib/auth";
import type { StockMovement } from "@/types/database";

export const inventoryRepository = {
  async movements(productId?: string): Promise<StockMovement[]> {
    const profile = await requireProfile();

    return db.query.stockMovements.findMany({
      where: and(
        eq(stockMovements.company_id, profile.company_id),
        productId ? eq(stockMovements.product_id, productId) : undefined,
      ),
      orderBy: desc(stockMovements.created_at),
      limit: 200,
      with: { products: true },
    });
  },

  async adjust(
    productId: string,
    changeQty: number,
    reason: string | null,
  ): Promise<number> {
    const tenant = await requireTenant();

    const result = await db.execute(sql`
      select adjust_stock(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${productId}::uuid,
        ${changeQty}::numeric,
        ${reason}
      ) as balance
    `);

    const row = firstRow<{ balance: string | number }>(result);
    if (!row) throw new Error("PRODUCT_NOT_FOUND");

    return Number(row.balance);
  },
};
