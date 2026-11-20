import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Package,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { dashboardRepository } from "@/repositories/dashboard_repository";

export const metadata = { title: "แดชบอร์ด" };

export default async function DashboardPage() {
  const [metrics, company] = await Promise.all([
    dashboardRepository.metrics(),
    getCurrentCompany(),
  ]);

  const currency = company?.currency ?? "THB";

  const stats = [
    {
      title: "ยอดขายเดือนนี้",
      value: formatCurrency(metrics.monthSales, currency),
      icon: Wallet,
      tone: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "เอกสารขายเดือนนี้",
      value: formatNumber(metrics.openOrders),
      icon: ShoppingCart,
      tone: "text-sky-600 bg-sky-50",
    },
    {
      title: "ลูกค้าทั้งหมด",
      value: formatNumber(metrics.customers),
      icon: Users,
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "สินค้าใกล้หมด",
      value: formatNumber(metrics.lowStock),
      icon: AlertTriangle,
      tone: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ภาพรวมธุรกิจ"
        description={`ข้อมูลสรุปของ ${company?.name ?? "บริษัท"} เดือนนี้`}
        actions={
          <Link
            href="/sales"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <ShoppingCart className="h-4 w-4" />
            สร้างเอกสารขาย
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.tone}`}
              >
                <stat.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="เอกสารขายล่าสุด"
            description="5 รายการล่าสุด"
            action={
              <Link
                href="/sales"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                ดูทั้งหมด
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>เลขที่</TableHeaderCell>
                <TableHeaderCell>ลูกค้า</TableHeaderCell>
                <TableHeaderCell>วันที่</TableHeaderCell>
                <TableHeaderCell>สถานะ</TableHeaderCell>
                <TableHeaderCell className="text-right">ยอดรวม</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.recentOrders.length === 0 ? (
                <TableEmpty colSpan={5} message="ยังไม่มีเอกสารขาย" />
              ) : (
                metrics.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-slate-900">
                      <Link
                        href={`/sales/${order.id}`}
                        className="hover:text-indigo-600"
                      >
                        {order.order_no}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customers?.name ?? "ลูกค้าทั่วไป"}</TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge tone="success">ยืนยันแล้ว</Badge>
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
          <CardHeader
            title="สต็อกต่ำ"
            description={`มูลค่าสต็อกรวม ${formatCurrency(metrics.stockValue, currency)}`}
          />
          <div className="divide-y divide-slate-100">
            {metrics.lowStockProducts.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                สต็อกทุกรายการอยู่ในระดับปกติ
              </p>
            ) : (
              metrics.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-rose-600">
                      {formatNumber(product.stock_qty)}
                    </p>
                    <p className="text-xs text-slate-400">
                      จุดสั่งซื้อ {formatNumber(product.reorder_point)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div className="px-5 py-3">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Boxes className="h-4 w-4" />
                ไปที่หน้าสต็อก
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" />
            สินค้าทั้งหมด {formatNumber(metrics.products)} รายการ
          </span>
          <span className="inline-flex items-center gap-2">
            <Boxes className="h-4 w-4 text-slate-400" />
            มูลค่าสต็อกตามราคาทุน {formatCurrency(metrics.stockValue, currency)}
          </span>
        </div>
      </Card>
    </div>
  );
}
