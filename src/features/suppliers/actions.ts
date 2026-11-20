"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { supplierRepository } from "@/repositories/supplier_repository";
import { supplierInputSchema } from "@/schemas/master-data";
import { formatDbError, parseWith } from "@/lib/validation";

export async function createSupplierAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(supplierInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await supplierRepository.create(parsed.data);
    revalidatePath("/suppliers");
    revalidatePath("/purchases");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function updateSupplierAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(supplierInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await supplierRepository.update(id, parsed.data);
    revalidatePath("/suppliers");
    revalidatePath("/purchases");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function archiveSupplierAction(
  id: string,
): Promise<ActionResult> {
  try {
    await supplierRepository.archive(id);
    revalidatePath("/suppliers");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
