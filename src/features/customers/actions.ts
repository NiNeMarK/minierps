"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { customerRepository } from "@/repositories/customer_repository";
import { customerInputSchema } from "@/schemas/master-data";
import { formatDbError, parseWith } from "@/lib/validation";

export async function createCustomerAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(customerInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await customerRepository.create(parsed.data);
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    revalidatePath("/sales");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function updateCustomerAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(customerInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await customerRepository.update(id, parsed.data);
    revalidatePath("/customers");
    revalidatePath("/sales");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function archiveCustomerAction(
  id: string,
): Promise<ActionResult> {
  try {
    await customerRepository.archive(id);
    revalidatePath("/customers");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
