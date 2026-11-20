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
import { CreateInvoiceDialog } from "@/features/invoices/components/create-invoice-dialog";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { invoiceRepository } from "@/repositories/invoice_repository";
import { salesRepository } from "@/repositories/sales_repository";

export default async function SalesOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, company, invoice] = await Promise.all([
    salesRepository.get(id),
    getCurrentCompany(),
    invoiceRepository.forOrder(id),
  ]);

  if (!order) notFound();

  const currency = company?.currency ?? "THB";

  return (
    <div className="space-y-6">
      <Link
        href="/sales"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าเอกสารขาย
      </Link>

      <PageHeader
        title={order.order_no}
        description={`สร้างเมื่อ ${formatDate(order.created_at)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">ยืนยันและตัดสต็อกแล้ว</Badge>
            {invoice ? (
              <Link
                href={`/invoices/${invoice.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                ใบแจ้งหนี้ {invoice.invoice_no}
              </Link>
            ) : (
              <CreateInvoiceDialog
                salesOrderId={order.id}
                total={order.total_amount}
                currency={currency}
              />
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">ลูกค้า</p>
          <p className="mt-1 font-medium text-slate-900">
            {order.customers?.name ?? "ลูกค้าทั่วไป"}
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
            หมายเหตุ
          </p>
          <p className="mt-1 text-sm text-slate-700">{order.note ?? "-"}</p>
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
            {order.sales_order_lines.map((line) => (
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
