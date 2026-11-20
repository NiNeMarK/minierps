"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { inventoryRepository } from "@/repositories/inventory_repository";
import { stockAdjustmentSchema } from "@/schemas/master-data";
import { formatDbError, parseWith } from "@/lib/validation";

export async function adjustStockAction(
  input: unknown,
): Promise<ActionResult<{ balance: number }>> {
  const parsed = parseWith(stockAdjustmentSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    const balance = await inventoryRepository.adjust(
      parsed.data.product_id,
      parsed.data.change_qty,
      parsed.data.reason,
    );

    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/dashboard");

    return { ok: true, data: { balance } };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
