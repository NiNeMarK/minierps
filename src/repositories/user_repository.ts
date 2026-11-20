import { and, asc, eq, sql } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

import { db } from "@/db";
import { firstRow } from "@/db/result";
import { profiles, user } from "@/db/schema";
import { requireProfile, requireTenant } from "@/lib/auth";
import type { InviteUserValues } from "@/schemas/users";
import type { CompanyUser, UserRole } from "@/types/database";

async function findMember(companyId: string, userId: string) {
  const [member] = await db
    .select()
    .from(profiles)
    .where(
      and(eq(profiles.id, userId), eq(profiles.company_id, companyId)),
    )
    .limit(1);

  return member ?? null;
}

async function ownerCount(companyId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(profiles)
    .where(
      and(eq(profiles.company_id, companyId), eq(profiles.role, "owner")),
    );

  return Number(row?.count ?? 0);
}

export const userRepository = {
  async list(): Promise<CompanyUser[]> {
    const profile = await requireProfile();

    return db
      .select({
        id: profiles.id,
        email: user.email,
        name: user.name,
        full_name: profiles.full_name,
        role: profiles.role,
        created_at: profiles.created_at,
      })
      .from(profiles)
      .innerJoin(user, eq(profiles.id, user.id))
      .where(eq(profiles.company_id, profile.company_id))
      .orderBy(asc(profiles.created_at));
  },

  async invite(values: InviteUserValues): Promise<string> {
    const tenant = await requireTenant();
    const passwordHash = await hashPassword(values.password);

    const result = await db.execute(sql`
      select invite_company_user(
        ${tenant.companyId}::uuid,
        ${tenant.userId},
        ${values.email},
        ${values.name},
        ${values.role},
        ${passwordHash}
      ) as id
    `);

    const row = firstRow<{ id: string }>(result);
    if (!row) throw new Error("INVITE_FAILED");

    return row.id;
  },

  async updateRole(userId: string, role: UserRole): Promise<void> {
    const profile = await requireProfile();
    const target = await findMember(profile.company_id, userId);

    if (!target) throw new Error("USER_NOT_FOUND");
    if (target.id === profile.id) throw new Error("CANNOT_MODIFY_SELF");

    if (profile.role === "admin") {
      if (target.role === "owner") throw new Error("OWNER_PROTECTED");
      if (role === "owner") throw new Error("OWNER_PROTECTED");
    }

    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("NOT_AUTHORIZED");
    }

    if (
      target.role === "owner" &&
      role !== "owner" &&
      (await ownerCount(profile.company_id)) <= 1
    ) {
      throw new Error("LAST_OWNER");
    }

    await db
      .update(profiles)
      .set({ role })
      .where(
        and(
          eq(profiles.id, userId),
          eq(profiles.company_id, profile.company_id),
        ),
      );
  },

  async remove(userId: string): Promise<void> {
    const profile = await requireProfile();
    const target = await findMember(profile.company_id, userId);

    if (!target) throw new Error("USER_NOT_FOUND");
    if (target.id === profile.id) throw new Error("CANNOT_REMOVE_SELF");

    if (profile.role === "admin" && target.role === "owner") {
      throw new Error("OWNER_PROTECTED");
    }

    if (profile.role !== "owner" && profile.role !== "admin") {
      throw new Error("NOT_AUTHORIZED");
    }

    if (
      target.role === "owner" &&
      (await ownerCount(profile.company_id)) <= 1
    ) {
      throw new Error("LAST_OWNER");
    }

    // The profile, sessions and credentials cascade from the auth user.
    await db.delete(user).where(eq(user.id, userId));
  },

  async updateName(fullName: string): Promise<void> {
    const profile = await requireProfile();

    await db
      .update(profiles)
      .set({ full_name: fullName })
      .where(eq(profiles.id, profile.id));

    await db.update(user).set({ name: fullName }).where(eq(user.id, profile.id));
  },
};
