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
import { createPurchaseOrderAction } from "@/features/purchases/actions";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { branchRepository } from "@/repositories/branch_repository";
import { productRepository } from "@/repositories/product_repository";
import { purchaseRepository } from "@/repositories/purchase_repository";
import { supplierRepository } from "@/repositories/supplier_repository";
import { warehouseRepository } from "@/repositories/warehouse_repository";

export const metadata = { title: "จัดซื้อ" };

const statusTone = {
  draft: "neutral",
  ordered: "info",
  received: "success",
  cancelled: "danger",
} as const;

const statusLabel = {
  draft: "ฉบับร่าง",
  ordered: "สั่งซื้อแล้ว",
  received: "รับสินค้าแล้ว",
  cancelled: "ยกเลิก",
};

export default async function PurchasesPage() {
  const [orders, suppliers, branches, warehouses, products, company] =
    await Promise.all([
      purchaseRepository.list(),
      supplierRepository.list(),
      branchRepository.list(),
      warehouseRepository.list(),
      productRepository.list({ activeOnly: true }),
      getCurrentCompany(),
    ]);

  const currency = company?.currency ?? "THB";

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดซื้อ"
        description="ออกใบสั่งซื้อและรับสินค้าเข้าสต็อก"
        actions={
          <OrderDialog
            kind="purchase"
            parties={suppliers
              .filter((supplier) => supplier.is_active)
              .map((supplier) => ({ id: supplier.id, name: supplier.name }))}
            branches={branches
              .filter((branch) => branch.is_active)
              .map((branch) => ({ id: branch.id, name: branch.name }))}
            warehouses={warehouses
              .filter((warehouse) => warehouse.is_active)
              .map((warehouse) => ({ id: warehouse.id, name: warehouse.name }))}
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              sell_price: product.sell_price,
              cost_price: product.cost_price,
              stock_qty: product.stock_qty,
            }))}
            action={createPurchaseOrderAction}
          />
        }
      />

      {products.length === 0 ? (
        <EmptyState
          title="ยังไม่มีสินค้าสำหรับสั่งซื้อ"
          description="เพิ่มสินค้าก่อนออกใบสั่งซื้อ"
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
                <TableHeaderCell>ผู้ขาย</TableHeaderCell>
                <TableHeaderCell>วันที่</TableHeaderCell>
                <TableHeaderCell>สถานะ</TableHeaderCell>
                <TableHeaderCell className="text-right">ยอดรวม</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableEmpty colSpan={5} message="ยังไม่มีใบสั่งซื้อ" />
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/purchases/${order.id}`}
                        className="text-slate-900 hover:text-indigo-600"
                      >
                        {order.order_no}
                      </Link>
                    </TableCell>
                    <TableCell>{order.suppliers?.name ?? "-"}</TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTone[order.status]}>
                        {statusLabel[order.status]}
                      </Badge>
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
