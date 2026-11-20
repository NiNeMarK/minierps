"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { recordPaymentAction } from "@/features/invoices/actions";
import { formatCurrency } from "@/lib/utils";
import {
  paymentInputSchema,
  paymentMethodLabels,
} from "@/schemas/invoices";

export function RecordPaymentDialog({
  invoiceId,
  balance,
  currency,
}: {
  invoiceId: string;
  balance: number;
  currency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(balance.toFixed(2));
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setError(null);

    const parsed = paymentInputSchema.safeParse({
      invoice_id: invoiceId,
      amount,
      method,
      reference,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    if (parsed.data.amount > balance) {
      setError("จำนวนเงินเกินยอดคงเหลือของใบแจ้งหนี้");
      return;
    }

    setPending(true);

    try {
      const result = await recordPaymentAction(parsed.data);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setAmount(balance.toFixed(2));
          setError(null);
          setOpen(true);
        }}
        disabled={balance <= 0}
      >
        บันทึกรับชำระ
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="บันทึกรับชำระ"
        description={`ยอดคงเหลือ ${formatCurrency(balance, currency)}`}
      >
        <div className="space-y-4">
          <Field label="จำนวนเงิน" htmlFor="payment-amount">
            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              step="0.01"
              max={balance}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>

          <Field label="วิธีชำระ" htmlFor="payment-method">
            <Select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="เลขอ้างอิง"
            htmlFor="payment-reference"
            hint="เช่น เลขที่ธุรกรรมหรือเลขใบเสร็จ (ถ้ามี)"
          >
            <Input
              id="payment-reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </Field>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "กำลังบันทึก..." : "บันทึกการชำระ"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
