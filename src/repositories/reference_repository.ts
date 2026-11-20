import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { categories, units } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { Category, Unit } from "@/types/database";

export const referenceRepository = {
  async categories(): Promise<Category[]> {
    const profile = await requireProfile();

    return db.query.categories.findMany({
      where: eq(categories.company_id, profile.company_id),
      orderBy: asc(categories.name),
    });
  },

  async units(): Promise<Unit[]> {
    const profile = await requireProfile();

    return db.query.units.findMany({
      where: eq(units.company_id, profile.company_id),
      orderBy: asc(units.name),
    });
  },
};
