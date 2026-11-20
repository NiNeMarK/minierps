import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { SupplierValues } from "@/schemas/master-data";
import type { Supplier } from "@/types/database";

export const supplierRepository = {
  async list(search?: string): Promise<Supplier[]> {
    const profile = await requireProfile();

    const conditions = [eq(suppliers.company_id, profile.company_id)];

    if (search) {
      const term = `%${search.replaceAll(",", " ")}%`;
      const searchCondition = or(
        ilike(suppliers.name, term),
        ilike(suppliers.phone, term),
        ilike(suppliers.email, term),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    return db.query.suppliers.findMany({
      where: and(...conditions),
      orderBy: desc(suppliers.created_at),
    });
  },

  async create(values: SupplierValues): Promise<Supplier> {
    const profile = await requireProfile();

    const [supplier] = await db
      .insert(suppliers)
      .values({ ...values, company_id: profile.company_id })
      .returning();

    return supplier;
  },

  async update(id: string, values: SupplierValues): Promise<Supplier> {
    const profile = await requireProfile();

    const [supplier] = await db
      .update(suppliers)
      .set(values)
      .where(
        and(eq(suppliers.id, id), eq(suppliers.company_id, profile.company_id)),
      )
      .returning();

    if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");

    return supplier;
  },

  async archive(id: string): Promise<void> {
    const profile = await requireProfile();

    await db
      .update(suppliers)
      .set({ is_active: false })
      .where(
        and(eq(suppliers.id, id), eq(suppliers.company_id, profile.company_id)),
      );
  },
};
