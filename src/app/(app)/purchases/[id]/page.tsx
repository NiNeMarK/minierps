import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { ReceiveButton } from "@/features/purchases/components/receive-button";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { purchaseRepository } from "@/repositories/purchase_repository";

const statusLabel = {
  draft: "ฉบับร่าง",
  ordered: "สั่งซื้อแล้ว",
  received: "รับสินค้าแล้ว",
  cancelled: "ยกเลิก",
};

const statusTone = {
  draft: "neutral",
  ordered: "info",
  received: "success",
  cancelled: "danger",
} as const;

export default async function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, company] = await Promise.all([
    purchaseRepository.get(id),
    getCurrentCompany(),
  ]);

  if (!order) notFound();

  const currency = company?.currency ?? "THB";

  return (
    <div className="space-y-6">
      <Link
        href="/purchases"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าใบสั่งซื้อ
      </Link>

      <PageHeader
        title={order.order_no}
        description={`สร้างเมื่อ ${formatDate(order.created_at)}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={statusTone[order.status]}>
              {statusLabel[order.status]}
            </Badge>
            {order.status === "ordered" ? (
              <ReceiveButton id={order.id} />
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            คลังที่รับสินค้า
          </p>
          <p className="mt-1 font-medium text-slate-900">
            {order.warehouses?.name ?? "คลังหลัก"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ผู้ขาย
          </p>
          <p className="mt-1 font-medium text-slate-900">
            {order.suppliers?.name ?? "-"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ยอดรวม
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(order.total_amount, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            วันที่รับสินค้า
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {order.received_at ? formatDate(order.received_at) : "-"}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader title="รายการสินค้า" />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>สินค้า</TableHeaderCell>
              <TableHeaderCell className="text-right">จำนวน</TableHeaderCell>
              <TableHeaderCell className="text-right">ราคาต่อหน่วย</TableHeaderCell>
              <TableHeaderCell className="text-right">รวม</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.purchase_order_lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>
                  <p className="font-medium text-slate-800">
                    {line.products?.name ?? "-"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {line.products?.sku}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(line.qty)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(line.unit_price, currency)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(line.line_total, currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
