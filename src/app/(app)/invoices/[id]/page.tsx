import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import {
  invoiceStatusLabels,
  invoiceStatusTones,
} from "@/constants/invoices";
import { RecordPaymentDialog } from "@/features/invoices/components/payment-dialog";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDate, formatDateOnly, formatNumber } from "@/lib/utils";
import { invoiceRepository } from "@/repositories/invoice_repository";
import { paymentMethodLabels } from "@/schemas/invoices";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, company] = await Promise.all([
    invoiceRepository.get(id),
    getCurrentCompany(),
  ]);

  if (!invoice) notFound();

  const currency = company?.currency ?? "THB";
  const balance = invoice.total_amount - invoice.paid_amount;
  const lines = invoice.sales_orders?.sales_order_lines ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/invoices"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้าใบแจ้งหนี้
      </Link>

      <PageHeader
        title={invoice.invoice_no}
        description={`ออกเมื่อ ${formatDate(invoice.issue_date)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={invoiceStatusTones[invoice.status]}>
              {invoiceStatusLabels[invoice.status]}
            </Badge>
            {invoice.status !== "cancelled" && balance > 0 ? (
              <RecordPaymentDialog
                invoiceId={invoice.id}
                balance={balance}
                currency={currency}
              />
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">ลูกค้า</p>
          <p className="mt-1 font-medium text-slate-900">
            {invoice.customers?.name ?? "ลูกค้าทั่วไป"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">ยอดรวม</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatCurrency(invoice.total_amount, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            รับชำระแล้ว
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {formatCurrency(invoice.paid_amount, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            คงเหลือ
          </p>
          <p className="mt-1 text-xl font-bold text-amber-600">
            {formatCurrency(balance, currency)}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            วันครบกำหนด
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {formatDateOnly(invoice.due_date)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            เอกสารขายอ้างอิง
          </p>
          {invoice.sales_orders ? (
            <Link
              href={`/sales/${invoice.sales_orders.id}`}
              className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <FileText className="h-4 w-4" />
              {invoice.sales_orders.order_no}
            </Link>
          ) : (
            <p className="mt-1 text-sm text-slate-500">-</p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="รายการสินค้า" description="คัดลอกจากเอกสารขาย" />
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
            {lines.length === 0 ? (
              <TableEmpty colSpan={4} message="ไม่พบรายการสินค้า" />
            ) : (
              lines.map((line) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="ประวัติการรับชำระ" />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>วันที่</TableHeaderCell>
              <TableHeaderCell>วิธีชำระ</TableHeaderCell>
              <TableHeaderCell>เลขอ้างอิง</TableHeaderCell>
              <TableHeaderCell className="text-right">จำนวนเงิน</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.payments.length === 0 ? (
              <TableEmpty colSpan={4} message="ยังไม่มีการรับชำระ" />
            ) : (
              invoice.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDate(payment.paid_at)}
                  </TableCell>
                  <TableCell>{paymentMethodLabels[payment.method]}</TableCell>
                  <TableCell className="text-slate-500">
                    {payment.reference ?? "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">
                    {formatCurrency(payment.amount, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {invoice.note ? (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            หมายเหตุ
          </p>
          <p className="mt-1 text-sm text-slate-700">{invoice.note}</p>
        </Card>
      ) : null}
    </div>
  );
}
