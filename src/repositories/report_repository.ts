import { and, asc, desc, eq, gte, lte, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  invoices,
  products,
  purchaseOrders,
  salesOrders,
} from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type {
  Invoice,
  Product,
  PurchaseOrder,
  SalesOrder,
} from "@/types/database";

export interface SalesReport {
  orders: SalesOrder[];
  total: number;
  count: number;
}

export interface PurchaseReport {
  orders: PurchaseOrder[];
  total: number;
  count: number;
}

export const reportRepository = {
  async sales(from: Date, to: Date): Promise<SalesReport> {
    const profile = await requireProfile();

    const orders = await db.query.salesOrders.findMany({
      where: and(
        eq(salesOrders.company_id, profile.company_id),
        gte(salesOrders.created_at, from),
        lte(salesOrders.created_at, to),
        ne(salesOrders.status, "cancelled"),
      ),
      orderBy: desc(salesOrders.created_at),
      with: { customers: true },
    });

    return {
      orders,
      count: orders.length,
      total: orders.reduce((sum, order) => sum + order.total_amount, 0),
    };
  },

  async purchases(from: Date, to: Date): Promise<PurchaseReport> {
    const profile = await requireProfile();

    const orders = await db.query.purchaseOrders.findMany({
      where: and(
        eq(purchaseOrders.company_id, profile.company_id),
        gte(purchaseOrders.created_at, from),
        lte(purchaseOrders.created_at, to),
        ne(purchaseOrders.status, "cancelled"),
      ),
      orderBy: desc(purchaseOrders.created_at),
      with: { suppliers: true },
    });

    return {
      orders,
      count: orders.length,
      total: orders.reduce((sum, order) => sum + order.total_amount, 0),
    };
  },

  async stock(): Promise<Product[]> {
    const profile = await requireProfile();

    return db.query.products.findMany({
      where: and(
        eq(products.company_id, profile.company_id),
        eq(products.is_active, true),
      ),
      orderBy: asc(products.sku),
    });
  },

  async receivables(from: Date, to: Date): Promise<Invoice[]> {
    const profile = await requireProfile();

    return db.query.invoices.findMany({
      where: and(
        eq(invoices.company_id, profile.company_id),
        gte(invoices.issue_date, from),
        lte(invoices.issue_date, to),
        ne(invoices.status, "paid"),
        ne(invoices.status, "cancelled"),
      ),
      orderBy: desc(invoices.issue_date),
      with: { customers: true },
    });
  },
};
