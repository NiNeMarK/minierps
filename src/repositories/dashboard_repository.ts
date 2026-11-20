import { and, desc, eq, gte, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { customers, products, salesOrders } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { DashboardMetrics } from "@/types/database";

export const dashboardRepository = {
  async metrics(): Promise<DashboardMetrics> {
    const profile = await requireProfile();
    const companyId = profile.company_id;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [orderTotals, customerTotals, productRows, recentOrders] =
      await Promise.all([
        db
          .select({
            count: sql<string>`count(*)`,
            total: sql<string>`coalesce(sum(${salesOrders.total_amount}), 0)`,
          })
          .from(salesOrders)
          .where(
            and(
              eq(salesOrders.company_id, companyId),
              gte(salesOrders.created_at, monthStart),
              ne(salesOrders.status, "cancelled"),
            ),
          ),
        db
          .select({ count: sql<string>`count(*)` })
          .from(customers)
          .where(
            and(
              eq(customers.company_id, companyId),
              eq(customers.is_active, true),
            ),
          ),
        db
          .select()
          .from(products)
          .where(
            and(
              eq(products.company_id, companyId),
              eq(products.is_active, true),
            ),
          ),
        db.query.salesOrders.findMany({
          where: eq(salesOrders.company_id, companyId),
          orderBy: desc(salesOrders.created_at),
          limit: 5,
          with: { customers: true },
        }),
      ]);

    const lowStockProducts = productRows.filter(
      (product) => product.stock_qty <= product.reorder_point,
    );

    return {
      monthSales: Number(orderTotals[0]?.total ?? 0),
      openOrders: Number(orderTotals[0]?.count ?? 0),
      customers: Number(customerTotals[0]?.count ?? 0),
      lowStock: lowStockProducts.length,
      products: productRows.length,
      stockValue: productRows.reduce(
        (total, product) => total + product.stock_qty * product.cost_price,
        0,
      ),
      recentOrders,
      lowStockProducts: lowStockProducts.slice(0, 5),
    };
  },
};
