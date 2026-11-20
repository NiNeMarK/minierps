"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { formatDbError, parseWith } from "@/lib/validation";
import { warehouseRepository } from "@/repositories/warehouse_repository";
import {
  warehouseInputSchema,
  type WarehouseValues,
} from "@/schemas/master-data";

function revalidateWarehouses() {
  revalidatePath("/warehouses");
  revalidatePath("/inventory");
  revalidatePath("/sales");
  revalidatePath("/purchases");
}

export async function createWarehouseAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(warehouseInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await warehouseRepository.create(parsed.data);
    revalidateWarehouses();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function updateWarehouseAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(warehouseInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await warehouseRepository.update(id, parsed.data as WarehouseValues);
    revalidateWarehouses();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function archiveWarehouseAction(id: string): Promise<ActionResult> {
  try {
    await warehouseRepository.archive(id);
    revalidateWarehouses();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
