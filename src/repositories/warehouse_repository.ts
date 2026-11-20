import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { warehouses } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { WarehouseValues } from "@/schemas/master-data";
import type { Warehouse } from "@/types/database";

export const warehouseRepository = {
  async list(): Promise<Warehouse[]> {
    const profile = await requireProfile();

    return db.query.warehouses.findMany({
      where: eq(warehouses.company_id, profile.company_id),
      orderBy: asc(warehouses.created_at),
      with: { branches: true },
    });
  },

  async create(values: WarehouseValues): Promise<Warehouse> {
    const profile = await requireProfile();

    const [warehouse] = await db
      .insert(warehouses)
      .values({ ...values, company_id: profile.company_id })
      .returning();

    return warehouse;
  },

  async update(id: string, values: WarehouseValues): Promise<Warehouse> {
    const profile = await requireProfile();

    const [warehouse] = await db
      .update(warehouses)
      .set(values)
      .where(
        and(
          eq(warehouses.id, id),
          eq(warehouses.company_id, profile.company_id),
        ),
      )
      .returning();

    if (!warehouse) throw new Error("WAREHOUSE_NOT_FOUND");

    return warehouse;
  },

  async archive(id: string): Promise<void> {
    const profile = await requireProfile();

    await db
      .update(warehouses)
      .set({ is_active: false })
      .where(
        and(
          eq(warehouses.id, id),
          eq(warehouses.company_id, profile.company_id),
        ),
      );
  },
};
