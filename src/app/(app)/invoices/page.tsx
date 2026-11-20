import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/page-header";
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
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDateOnly } from "@/lib/utils";
import { invoiceRepository } from "@/repositories/invoice_repository";

export const metadata = { title: "ใบแจ้งหนี้" };

export default async function InvoicesPage() {
  const [invoices, company] = await Promise.all([
    invoiceRepository.list(),
    getCurrentCompany(),
  ]);

  const currency = company?.currency ?? "THB";

  const outstanding = invoices
    .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
    .reduce(
      (sum, invoice) => sum + (invoice.total_amount - invoice.paid_amount),
      0,
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="ใบแจ้งหนี้"
        description="ติดตามยอดเรียกเก็บและการรับชำระจากลูกค้า"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ใบแจ้งหนี้ทั้งหมด
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {invoices.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ยอดค้างชำระ
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(outstanding, currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            รับชำระแล้ว
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatCurrency(
              invoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0),
              currency,
            )}
          </p>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="ยังไม่มีใบแจ้งหนี้"
          description="เปิดเอกสารขายที่ต้องการแล้วกด “ออกใบแจ้งหนี้”"
          action={
            <Link
              href="/sales"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ไปที่เอกสารขาย
            </Link>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>เลขที่</TableHeaderCell>
                <TableHeaderCell>ลูกค้า</TableHeaderCell>
                <TableHeaderCell>วันที่ออก</TableHeaderCell>
                <TableHeaderCell>ครบกำหนด</TableHeaderCell>
                <TableHeaderCell className="text-right">ยอดรวม</TableHeaderCell>
                <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
                <TableHeaderCell>สถานะ</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length === 0 ? (
                <TableEmpty colSpan={7} message="ยังไม่มีใบแจ้งหนี้" />
              ) : (
                invoices.map((invoice) => {
                  const balance = invoice.total_amount - invoice.paid_amount;

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-slate-900 hover:text-indigo-600"
                        >
                          {invoice.invoice_no}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {invoice.customers?.name ?? "ลูกค้าทั่วไป"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-500">
                        {formatDateOnly(invoice.issue_date)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-slate-500">
                        {formatDateOnly(invoice.due_date)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.total_amount, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(balance, currency)}
                      </TableCell>
                      <TableCell>
                        <Badge tone={invoiceStatusTones[invoice.status]}>
                          {invoiceStatusLabels[invoice.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
