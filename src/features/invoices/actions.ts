"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { formatDbError, parseWith } from "@/lib/validation";
import { invoiceRepository } from "@/repositories/invoice_repository";
import {
  invoiceCreateSchema,
  paymentInputSchema,
} from "@/schemas/invoices";

export async function createInvoiceAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = parseWith(invoiceCreateSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    const id = await invoiceRepository.createForOrder(parsed.data);

    revalidatePath("/invoices");
    revalidatePath("/sales");
    revalidatePath(`/sales/${parsed.data.sales_order_id}`);

    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function recordPaymentAction(
  input: unknown,
): Promise<ActionResult<{ paid: number }>> {
  const parsed = parseWith(paymentInputSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    const paid = await invoiceRepository.recordPayment(parsed.data);

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${parsed.data.invoice_id}`);
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { ok: true, data: { paid } };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
