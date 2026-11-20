"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { purchaseRepository } from "@/repositories/purchase_repository";
import { purchaseOrderInputSchema } from "@/schemas/master-data";
import { formatDbError, parseWith } from "@/lib/validation";

export async function createPurchaseOrderAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseWith(purchaseOrderInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    const id = await purchaseRepository.create(parsed.data);

    revalidatePath("/purchases");
    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function receivePurchaseOrderAction(
  id: string,
): Promise<ActionResult> {
  try {
    await purchaseRepository.receive(id);

    revalidatePath("/purchases");
    revalidatePath("/products");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
