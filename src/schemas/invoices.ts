import * as z from "zod";

const emptyToNull = (value: unknown) =>
  value === "" || value === null || value === undefined ? null : value;

const optionalText = z.preprocess(
  emptyToNull,
  z.string().trim().max(500).nullable(),
);

const optionalDate = z.preprocess(
  emptyToNull,
  z.string().trim().max(40).nullable(),
);

export const invoiceCreateSchema = z.object({
  sales_order_id: z.string().uuid("ไม่พบเอกสารขาย"),
  due_date: optionalDate,
  note: optionalText,
});

export const paymentMethodSchema = z.enum([
  "cash",
  "transfer",
  "card",
  "other",
]);

export const paymentInputSchema = z.object({
  invoice_id: z.string().uuid("ไม่พบใบแจ้งหนี้"),
  amount: z.coerce.number().positive("จำนวนเงินต้องมากกว่า 0"),
  method: paymentMethodSchema.default("cash"),
  reference: optionalText,
});

export type InvoiceCreateInput = z.input<typeof invoiceCreateSchema>;
export type InvoiceCreateValues = z.output<typeof invoiceCreateSchema>;
export type PaymentInput = z.input<typeof paymentInputSchema>;
export type PaymentValues = z.output<typeof paymentInputSchema>;

export const paymentMethodLabels: Record<
  z.infer<typeof paymentMethodSchema>,
  string
> = {
  cash: "เงินสด",
  transfer: "โอนเงิน",
  card: "บัตร",
  other: "อื่น ๆ",
};
