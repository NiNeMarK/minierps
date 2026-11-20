import Link from "next/link";

import { OrderDialog } from "@/components/orders/order-dialog";
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
import { createSalesOrderAction } from "@/features/sales/actions";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { branchRepository } from "@/repositories/branch_repository";
import { customerRepository } from "@/repositories/customer_repository";
import { productRepository } from "@/repositories/product_repository";
import { salesRepository } from "@/repositories/sales_repository";

export const metadata = { title: "ขาย" };

export default async function SalesPage() {
  const [orders, customers, branches, products, company] = await Promise.all([
    salesRepository.list(),
    customerRepository.list(),
    branchRepository.list(),
    productRepository.list({ activeOnly: true }),
    getCurrentCompany(),
  ]);

  const currency = company?.currency ?? "THB";

  return (
    <div className="space-y-6">
      <PageHeader
        title="ขาย"
        description="สร้างเอกสารขายและตัดสต็อกอัตโนมัติ"
        actions={
          <OrderDialog
            kind="sales"
            parties={customers
              .filter((customer) => customer.is_active)
              .map((customer) => ({ id: customer.id, name: customer.name }))}
            branches={branches
              .filter((branch) => branch.is_active)
              .map((branch) => ({ id: branch.id, name: branch.name }))}
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              sell_price: product.sell_price,
              cost_price: product.cost_price,
              stock_qty: product.stock_qty,
            }))}
            action={createSalesOrderAction}
          />
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="ยังไม่มีสินค้าให้ขาย"
          description="เพิ่มสินค้าและสต็อกก่อนสร้างเอกสารขาย"
          action={
            <Link
              href="/products"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ไปที่หน้าสินค้า
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
                <TableHeaderCell>วันที่</TableHeaderCell>
                <TableHeaderCell>สถานะ</TableHeaderCell>
                <TableHeaderCell className="text-right">ยอดรวม</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableEmpty colSpan={5} message="ยังไม่มีเอกสารขาย" />
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/sales/${order.id}`}
                        className="text-slate-900 hover:text-indigo-600"
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
      )}
    </div>
  );
}
