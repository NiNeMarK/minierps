import { and, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import type { CustomerValues } from "@/schemas/master-data";
import type { Customer } from "@/types/database";

export const customerRepository = {
  async list(search?: string): Promise<Customer[]> {
    const profile = await requireProfile();

    const conditions = [eq(customers.company_id, profile.company_id)];

    if (search) {
      const term = `%${search.replaceAll(",", " ")}%`;
      const searchCondition = or(
        ilike(customers.name, term),
        ilike(customers.phone, term),
        ilike(customers.email, term),
      );
      if (searchCondition) conditions.push(searchCondition);
    }

    return db.query.customers.findMany({
      where: and(...conditions),
      orderBy: desc(customers.created_at),
    });
  },

  async create(values: CustomerValues): Promise<Customer> {
    const profile = await requireProfile();

    const [customer] = await db
      .insert(customers)
      .values({ ...values, company_id: profile.company_id })
      .returning();

    return customer;
  },

  async update(id: string, values: CustomerValues): Promise<Customer> {
    const profile = await requireProfile();

    const [customer] = await db
      .update(customers)
      .set(values)
      .where(
        and(eq(customers.id, id), eq(customers.company_id, profile.company_id)),
      )
      .returning();

    if (!customer) throw new Error("CUSTOMER_NOT_FOUND");

    return customer;
  },

  async archive(id: string): Promise<void> {
    const profile = await requireProfile();

    await db
      .update(customers)
      .set({ is_active: false })
      .where(
        and(eq(customers.id, id), eq(customers.company_id, profile.company_id)),
      );
  },
};
