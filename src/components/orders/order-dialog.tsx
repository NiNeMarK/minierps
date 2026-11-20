"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import { formatCurrency } from "@/lib/utils";
import {
  purchaseOrderInputSchema,
  salesOrderInputSchema,
} from "@/schemas/master-data";

interface Option {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  sell_price: number;
  cost_price: number;
  stock_qty: number;
}

interface Line {
  product_id: string;
  qty: string;
  unit_price: string;
}

export function OrderDialog({
  kind,
  parties,
  branches,
  warehouses,
  products,
  action,
}: {
  kind: "sales" | "purchase";
  parties: Option[];
  branches: Option[];
  warehouses: Option[];
  products: ProductOption[];
  action: (
    values: Record<string, unknown>,
  ) => Promise<ActionResult<{ id: string }>>;
}) {
  const router = useRouter();
  const isSales = kind === "sales";
  const [open, setOpen] = useState(false);
  const [partyId, setPartyId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { product_id: "", qty: "1", unit_price: "0" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const total = lines.reduce(
    (sum, line) => sum + Number(line.qty || 0) * Number(line.unit_price || 0),
    0,
  );

  function reset() {
    setPartyId("");
    setBranchId("");
    setWarehouseId("");
    setNote("");
    setLines([{ product_id: "", qty: "1", unit_price: "0" }]);
    setError(null);
  }

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function onProductChange(index: number, productId: string) {
    const product = products.find((item) => item.id === productId);
    updateLine(index, {
      product_id: productId,
      unit_price: product
        ? String(isSales ? product.sell_price : product.cost_price)
        : "0",
    });
  }

  async function onSubmit() {
    setError(null);

    const payload = {
      customer_id: isSales ? partyId : null,
      supplier_id: isSales ? null : partyId,
      branch_id: branchId || null,
      warehouse_id: warehouseId || null,
      note,
      lines: lines.map((line) => ({
        product_id: line.product_id,
        qty: Number(line.qty || 0),
        unit_price: Number(line.unit_price || 0),
      })),
    };

    const schema = isSales ? salesOrderInputSchema : purchaseOrderInputSchema;
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
      return;
    }

    setPending(true);

    try {
      const result = await action(parsed.data as Record<string, unknown>);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      reset();

      if (result.data?.id) {
        router.push(`/${kind === "sales" ? "sales" : "purchases"}/${result.data.id}`);
      } else {
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        {isSales ? "สร้างเอกสารขาย" : "สร้างใบสั่งซื้อ"}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={isSales ? "สร้างเอกสารขาย" : "สร้างใบสั่งซื้อ"}
        description={
          isSales
            ? "ระบบจะตัดสต็อกทันทีเมื่อบันทึก"
            : "สต็อกจะเพิ่มเมื่อกดรับสินค้า"
        }
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={isSales ? "ลูกค้า" : "ผู้ขาย"}>
              <Select
                value={partyId}
                onChange={(event) => setPartyId(event.target.value)}
              >
                <option value="">
                  {isSales ? "ลูกค้าทั่วไป" : "ไม่ระบุผู้ขาย"}
                </option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="สาขา">
              <Select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
              >
                <option value="">ไม่ระบุสาขา</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="คลังสินค้า"
              hint={isSales ? "ตัดสต็อกจากคลังนี้" : "รับสินค้าเข้าคลังนี้"}
            >
              <Select
                value={warehouseId}
                onChange={(event) => setWarehouseId(event.target.value)}
              >
                <option value="">คลังหลัก (ค่าเริ่มต้น)</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="rounded-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">รายการสินค้า</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setLines((current) => [
                    ...current,
                    { product_id: "", qty: "1", unit_price: "0" },
                  ])
                }
              >
                <Plus className="h-4 w-4" />
                เพิ่มรายการ
              </Button>
            </div>

            <div className="space-y-3 p-4">
              {lines.map((line, index) => {
                const product = products.find(
                  (item) => item.id === line.product_id,
                );

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_100px_120px_36px]"
                  >
                    <Select
                      value={line.product_id}
                      onChange={(event) =>
                        onProductChange(index, event.target.value)
                      }
                    >
                      <option value="">เลือกสินค้า</option>
                      {products.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.sku} — {item.name}
                        </option>
                      ))}
                    </Select>

                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="จำนวน"
                      value={line.qty}
                      onChange={(event) =>
                        updateLine(index, { qty: event.target.value })
                      }
                    />

                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="ราคา"
                      value={line.unit_price}
                      onChange={(event) =>
                        updateLine(index, { unit_price: event.target.value })
                      }
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove line"
                      onClick={() =>
                        setLines((current) =>
                          current.length === 1
                            ? current
                            : current.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>

                    {product ? (
                      <p className="text-xs text-slate-500 sm:col-span-4">
                        คงเหลือ {product.stock_qty} ·{" "}
                        {formatCurrency(
                          Number(line.qty || 0) *
                            Number(line.unit_price || 0),
                        )}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <Field label="หมายเหตุ">
            <Textarea
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">ยอดรวม</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(total)}
            </span>
          </div>

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
              {pending ? "กำลังบันทึก..." : "บันทึกเอกสาร"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
