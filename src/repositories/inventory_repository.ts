import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { firstRow } from "@/db/result";
import { productStocks, stockMovements } from "@/db/schema";
import { requireProfile, requireTenant } from "@/lib/auth";
import type { ProductStock, StockMovement } from "@/types/database";

export const inventoryRepository = {
  async stocks(productId?: string, warehouseId?: string): Promise<ProductStock[]> {
    const profile = await requireProfile();

    const conditions = [eq(productStocks.company_id, profile.company_id)];

    if (productId) {
      conditions.push(eq(productStocks.product_id, productId));
    }

    if (warehouseId) {
      conditions.push(eq(productStocks.warehouse_id, warehouseId));
    }

    return db.query.productStocks.findMany({
      where: and(...conditions),
      orderBy: desc(productStocks.updated_at),
      with: { products: true, warehouses: true },
    });
  },

  async movements(productId?: string, warehouseId?: string): Promise<StockMovement[]> {
    const profile = await requireProfile();

    return db.query.stockMovements.findMany({
      where: and(
        eq(stockMovements.company_id, profile.company_id),
        productId ? eq(stockMovements.product_id, productId) : undefined,
        warehouseId
          ? eq(stockMovements.warehouse_id, warehouseId)
          : undefined,
      ),
      orderBy: desc(stockMovements.created_at),
      limit: 200,
      with: { products: true, warehouses: true },
    });
  },

  async adjust(
    productId: string,
    changeQty: number,
    reason: string | null,
    warehouseId?: string | null,
  ): Promise<number> {
    const tenant = await requireTenant();

    const result = await db.execute(sql`
      select adjust_stock(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${productId}::uuid,
        ${changeQty}::numeric,
        ${reason},
        ${warehouseId ?? null}::uuid
      ) as balance
    `);

    const row = firstRow<{ balance: string | number }>(result);
    if (!row) throw new Error("PRODUCT_NOT_FOUND");

    return Number(row.balance);
  },
};
