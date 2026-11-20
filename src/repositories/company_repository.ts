import { eq } from "drizzle-orm";

import { db } from "@/db";
import { companies } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { Company } from "@/types/database";

export interface CompanyValues {
  name: string;
  currency: string;
  timezone: string;
}

export const companyRepository = {
  async update(values: CompanyValues): Promise<Company> {
    const profile = await requireProfile();

    const [company] = await db
      .update(companies)
      .set(values)
      .where(eq(companies.id, profile.company_id))
      .returning();

    if (!company) throw new Error("COMPANY_NOT_FOUND");

    return company;
  },
};
