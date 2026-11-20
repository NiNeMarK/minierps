"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { branchRepository } from "@/repositories/branch_repository";
import { branchInputSchema } from "@/schemas/master-data";
import { formatDbError, parseWith } from "@/lib/validation";

export async function createBranchAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(branchInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await branchRepository.create(parsed.data);
    revalidatePath("/branches");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function updateBranchAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(branchInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await branchRepository.update(id, parsed.data);
    revalidatePath("/branches");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function archiveBranchAction(id: string): Promise<ActionResult> {
  try {
    await branchRepository.archive(id);
    revalidatePath("/branches");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
