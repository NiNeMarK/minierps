import { Card, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { buttonStyles } from "@/components/ui/button";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDateOnly, formatNumber } from "@/lib/utils";
import { reportRepository } from "@/repositories/report_repository";
import { resolveReportRange } from "@/schemas/reports";

export const metadata = { title: "รายงานและส่งออก" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const { from, to, fromValue, toValue } = resolveReportRange(
    params.from,
    params.to,
  );

  const [sales, purchases, stock, receivables, company] = await Promise.all([
    reportRepository.sales(from, to),
    reportRepository.purchases(from, to),
    reportRepository.stock(),
    reportRepository.receivables(from, to),
    getCurrentCompany(),
  ]);

  const currency = company?.currency ?? "THB";
  const query = `from=${encodeURIComponent(fromValue)}&to=${encodeURIComponent(toValue)}`;
  const outstanding = receivables.reduce(
    (sum, invoice) => sum + (invoice.total_amount - invoice.paid_amount),
    0,
  );
  const stockValue = stock.reduce(
    (sum, product) => sum + product.stock_qty * product.cost_price,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="รายงานและส่งออก"
        description="ดูข้อมูลช่วงเวลาที่เลือกและดาวน์โหลดเป็น CSV"
      />

      <Card className="p-5">
        <form method="get" className="flex flex-wrap items-end gap-4">
          <Field label="ตั้งแต่วันที่" htmlFor="report-from">
            <Input
              id="report-from"
              type="date"
              name="from"
              defaultValue={fromValue}
            />
          </Field>
          <Field label="ถึงวันที่" htmlFor="report-to">
            <Input
              id="report-to"
              type="date"
              name="to"
              defaultValue={toValue}
            />
          </Field>
          <button type="submit" className={buttonStyles()}>
            แสดงรายงาน
          </button>
        </form>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ยอดขายในช่วง
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(sales.total, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {sales.count} เอกสาร
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ยอดจัดซื้อในช่วง
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(purchases.total, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {purchases.count} เอกสาร
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            ยอดค้างชำระ
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatCurrency(outstanding, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {receivables.length} ใบแจ้งหนี้
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            มูลค่าสต็อก
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(stockValue, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stock.length} รายการสินค้า
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="ดาวน์โหลด CSV"
          description="ไฟล์มี BOM รองรับภาษาไทยใน Excel"
        />
        <div className="flex flex-wrap gap-2 p-5">
          {[
            { href: `/api/reports/sales?${query}`, label: "รายงานขาย" },
            {
              href: `/api/reports/purchases?${query}`,
              label: "รายงานจัดซื้อ",
            },
            { href: `/api/reports/stock?${query}`, label: "รายงานสต็อก" },
            {
              href: `/api/reports/receivables?${query}`,
              label: "รายงานลูกหนี้",
            },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={buttonStyles({ variant: "outline" })}
            >
              {item.label}
            </a>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="เอกสารขายในช่วง" />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>เลขที่</TableHeaderCell>
              <TableHeaderCell>ลูกค้า</TableHeaderCell>
              <TableHeaderCell>วันที่</TableHeaderCell>
              <TableHeaderCell className="text-right">ยอดรวม</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.orders.length === 0 ? (
              <TableEmpty colSpan={4} message="ไม่มีเอกสารขายในช่วงนี้" />
            ) : (
              sales.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_no}</TableCell>
                  <TableCell>{order.customers?.name ?? "ลูกค้าทั่วไป"}</TableCell>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDateOnly(order.created_at)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total_amount, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="ลูกหนี้ค้างชำระ" />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ใบแจ้งหนี้</TableHeaderCell>
              <TableHeaderCell>ลูกค้า</TableHeaderCell>
              <TableHeaderCell>ครบกำหนด</TableHeaderCell>
              <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {receivables.length === 0 ? (
              <TableEmpty colSpan={4} message="ไม่มีลูกหนี้ค้างชำระ" />
            ) : (
              receivables.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_no}
                  </TableCell>
                  <TableCell>{invoice.customers?.name ?? "ลูกค้าทั่วไป"}</TableCell>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDateOnly(invoice.due_date)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-amber-600">
                    {formatCurrency(
                      invoice.total_amount - invoice.paid_amount,
                      currency,
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="สต็อกคงเหลือ" />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>SKU</TableHeaderCell>
              <TableHeaderCell>สินค้า</TableHeaderCell>
              <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
              <TableHeaderCell className="text-right">มูลค่าทุน</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stock.length === 0 ? (
              <TableEmpty colSpan={4} message="ยังไม่มีสินค้า" />
            ) : (
              stock.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(product.stock_qty)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.stock_qty * product.cost_price, currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
