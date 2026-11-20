"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { createInvoiceAction } from "@/features/invoices/actions";
import { formatCurrency } from "@/lib/utils";
import { invoiceCreateSchema } from "@/schemas/invoices";

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export function CreateInvoiceDialog({
  salesOrderId,
  total,
  currency,
}: {
  salesOrderId: string;
  total: number;
  currency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setError(null);

    const parsed = invoiceCreateSchema.safeParse({
      sales_order_id: salesOrderId,
      due_date: dueDate,
      note,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    setPending(true);

    try {
      const result = await createInvoiceAction(parsed.data);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      router.push(`/invoices/${result.data?.id ?? ""}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
      >
        ออกใบแจ้งหนี้
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="ออกใบแจ้งหนี้"
        description={`ยอดเรียกเก็บ ${formatCurrency(total, currency)}`}
      >
        <div className="space-y-4">
          <Field label="วันครบกำหนดชำระ" htmlFor="invoice-due-date">
            <Input
              id="invoice-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </Field>

          <Field label="หมายเหตุ" htmlFor="invoice-note">
            <Textarea
              id="invoice-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="เงื่อนไขการชำระหรือรายละเอียดเพิ่มเติม"
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
              {pending ? "กำลังบันทึก..." : "ออกใบแจ้งหนี้"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
