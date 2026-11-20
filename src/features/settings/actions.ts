"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { requireProfile } from "@/lib/auth";
import { companyRepository } from "@/repositories/company_repository";
import { companySettingsSchema } from "@/schemas/company";
import { formatDbError, parseWith } from "@/lib/validation";

export async function updateCompanyAction(
  input: unknown,
): Promise<ActionResult> {
  const profile = await requireProfile();

  if (profile.role !== "owner" && profile.role !== "admin") {
    return { ok: false, error: "เฉพาะเจ้าของหรือผู้ดูแลระบบเท่านั้น" };
  }

  const parsed = parseWith(companySettingsSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await companyRepository.update(parsed.data);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
