"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { salesRepository } from "@/repositories/sales_repository";
import { salesOrderInputSchema } from "@/schemas/master-data";
import { formatDbError, parseWith } from "@/lib/validation";

export async function createSalesOrderAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseWith(salesOrderInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    const id = await salesRepository.create(parsed.data);

    revalidatePath("/sales");
    revalidatePath("/products");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
