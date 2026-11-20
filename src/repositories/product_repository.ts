import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { ProductValues } from "@/schemas/master-data";
import type { Product } from "@/types/database";

export interface ProductFilters {
  search?: string;
  lowStock?: boolean;
  activeOnly?: boolean;
}

export const productRepository = {
  async list(filters: ProductFilters = {}): Promise<Product[]> {
    const profile = await requireProfile();

    const conditions = [eq(products.company_id, profile.company_id)];

    if (filters.activeOnly) {
      conditions.push(eq(products.is_active, true));
    }

    if (filters.search) {
      const term = `%${filters.search.replaceAll(",", " ")}%`;
      const searchCondition = or(
        ilike(products.name, term),
        ilike(products.sku, term),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    const rows = await db.query.products.findMany({
      where: and(...conditions),
      orderBy: desc(products.created_at),
      with: { categories: true, units: true },
    });

    return filters.lowStock
      ? rows.filter((product) => product.stock_qty <= product.reorder_point)
      : rows;
  },

  async get(id: string): Promise<Product | null> {
    const profile = await requireProfile();

    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, id),
        eq(products.company_id, profile.company_id),
      ),
      with: { categories: true, units: true },
    });

    return product ?? null;
  },

  async create(values: ProductValues): Promise<Product> {
    const profile = await requireProfile();

    const [product] = await db
      .insert(products)
      .values({ ...values, company_id: profile.company_id })
      .returning();

    return product;
  },

  async update(id: string, values: ProductValues): Promise<Product> {
    const profile = await requireProfile();

    const [product] = await db
      .update(products)
      .set(values)
      .where(
        and(eq(products.id, id), eq(products.company_id, profile.company_id)),
      )
      .returning();

    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    return product;
  },

  async archive(id: string): Promise<void> {
    const profile = await requireProfile();

    await db
      .update(products)
      .set({ is_active: false })
      .where(
        and(eq(products.id, id), eq(products.company_id, profile.company_id)),
      );
  },
};
