"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { inventoryRepository } from "@/repositories/inventory_repository";
import { productRepository } from "@/repositories/product_repository";
import { productInputSchema } from "@/schemas/master-data";
import { formatDbError, parseWith } from "@/lib/validation";

function revalidateProducts() {
  revalidatePath("/products");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/sales");
  revalidatePath("/purchases");
}

export async function createProductAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(productInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  const { stock_qty, ...values } = parsed.data;

  try {
    const product = await productRepository.create({ ...values, stock_qty: 0 });

    if (stock_qty > 0) {
      await inventoryRepository.adjust(product.id, stock_qty, "Opening stock");
    }

    revalidateProducts();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(productInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    const current = await productRepository.get(id);

    if (!current) {
      return { ok: false, error: "ไม่พบสินค้า" };
    }

    // Stock changes must go through inventory adjustments.
    await productRepository.update(id, {
      ...parsed.data,
      stock_qty: current.stock_qty,
    });

    revalidateProducts();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function archiveProductAction(id: string): Promise<ActionResult> {
  try {
    await productRepository.archive(id);
    revalidateProducts();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
