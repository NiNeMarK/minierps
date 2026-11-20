import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { branches } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { BranchValues } from "@/schemas/master-data";
import type { Branch } from "@/types/database";

export const branchRepository = {
  async list(): Promise<Branch[]> {
    const profile = await requireProfile();

    return db.query.branches.findMany({
      where: eq(branches.company_id, profile.company_id),
      orderBy: asc(branches.created_at),
    });
  },

  async create(values: BranchValues): Promise<Branch> {
    const profile = await requireProfile();

    const [branch] = await db
      .insert(branches)
      .values({ ...values, company_id: profile.company_id })
      .returning();

    return branch;
  },

  async update(id: string, values: BranchValues): Promise<Branch> {
    const profile = await requireProfile();

    const [branch] = await db
      .update(branches)
      .set(values)
      .where(
        and(eq(branches.id, id), eq(branches.company_id, profile.company_id)),
      )
      .returning();

    if (!branch) throw new Error("BRANCH_NOT_FOUND");

    return branch;
  },

  async archive(id: string): Promise<void> {
    const profile = await requireProfile();

    await db
      .update(branches)
      .set({ is_active: false })
      .where(
        and(eq(branches.id, id), eq(branches.company_id, profile.company_id)),
      );
  },
};
