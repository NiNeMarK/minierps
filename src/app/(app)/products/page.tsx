import { Search } from "lucide-react";

import { ArchiveButton } from "@/components/ui/archive-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ResourceDialog, type DialogField } from "@/components/ui/resource-dialog";
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
  archiveProductAction,
  createProductAction,
  updateProductAction,
} from "@/features/products/actions";
import { getCurrentCompany } from "@/lib/auth";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { productRepository } from "@/repositories/product_repository";
import { referenceRepository } from "@/repositories/reference_repository";

export const metadata = { title: "สินค้า" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const [products, categories, units, company] = await Promise.all([
    productRepository.list({ search: q, activeOnly: false }),
    referenceRepository.categories(),
    referenceRepository.units(),
    getCurrentCompany(),
  ]);

  const currency = company?.currency ?? "THB";

  const selectFields: DialogField[] = [
    {
      name: "category_id",
      label: "หมวดหมู่",
      type: "select",
      options: categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    },
    {
      name: "unit_id",
      label: "หน่วยนับ",
      type: "select",
      options: units.map((unit) => ({
        value: unit.id,
        label: `${unit.name} (${unit.symbol})`,
      })),
    },
  ];

  const createFields: DialogField[] = [
    { name: "sku", label: "SKU", placeholder: "P-001" },
    { name: "name", label: "ชื่อสินค้า", placeholder: "สินค้าตัวอย่าง" },
    ...selectFields,
    {
      name: "cost_price",
      label: "ราคาทุน",
      type: "number",
      step: "0.01",
      min: "0",
    },
    {
      name: "sell_price",
      label: "ราคาขาย",
      type: "number",
      step: "0.01",
      min: "0",
    },
    {
      name: "reorder_point",
      label: "จุดสั่งซื้อ",
      type: "number",
      step: "0.01",
      min: "0",
    },
    {
      name: "stock_qty",
      label: "สต็อกเริ่มต้น",
      type: "number",
      step: "0.01",
      min: "0",
      hint: "ระบบจะบันทึกเป็นรายการเคลื่อนไหวเริ่มต้น",
    },
    { name: "is_active", label: "เปิดใช้งาน", type: "checkbox" },
  ];

  const editFields = createFields.filter(
    (field) => field.name !== "stock_qty",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="สินค้า"
        description="จัดการข้อมูลสินค้า ราคา และจุดสั่งซื้อ"
        actions={
          <ResourceDialog
            triggerLabel="เพิ่มสินค้า"
            title="เพิ่มสินค้า"
            description="สร้างข้อมูลสินค้าใหม่ในบริษัทของคุณ"
            submitLabel="บันทึกสินค้า"
            fields={createFields}
            schema="product"
            defaultValues={{
              sku: "",
              name: "",
              category_id: "",
              unit_id: "",
              cost_price: 0,
              sell_price: 0,
              reorder_point: 0,
              stock_qty: 0,
              is_active: true,
            }}
            action={createProductAction}
          />
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <form className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="ค้นหาชื่อหรือ SKU..."
              className="pl-9"
            />
          </form>
          <p className="text-sm text-slate-500">
            ทั้งหมด {formatNumber(products.length)} รายการ
          </p>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>SKU</TableHeaderCell>
              <TableHeaderCell>สินค้า</TableHeaderCell>
              <TableHeaderCell>หมวดหมู่</TableHeaderCell>
              <TableHeaderCell className="text-right">ราคาทุน</TableHeaderCell>
              <TableHeaderCell className="text-right">ราคาขาย</TableHeaderCell>
              <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
              <TableHeaderCell className="text-right">จัดการ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableEmpty
                colSpan={8}
                message={
                  q ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้า เริ่มเพิ่มรายการแรก"
                }
              />
            ) : (
              products.map((product) => {
                const low =
                  product.is_active &&
                  product.stock_qty <= product.reorder_point;

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-slate-900">
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-800">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.units?.symbol ?? "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {product.categories?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.cost_price, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.sell_price, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          low ? "font-semibold text-rose-600" : "text-slate-700"
                        }
                      >
                        {formatNumber(product.stock_qty)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.is_active ? (
                        low ? (
                          <Badge tone="warning">ใกล้หมด</Badge>
                        ) : (
                          <Badge tone="success">ใช้งาน</Badge>
                        )
                      ) : (
                        <Badge>ปิดใช้งาน</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ResourceDialog
                          triggerLabel="แก้ไข"
                          title={`แก้ไข ${product.name}`}
                          submitLabel="บันทึกการแก้ไข"
                          variant="ghost"
                          fields={editFields}
                          schema="product"
                          defaultValues={{
                            sku: product.sku,
                            name: product.name,
                            category_id: product.category_id ?? "",
                            unit_id: product.unit_id ?? "",
                            cost_price: product.cost_price,
                            sell_price: product.sell_price,
                            reorder_point: product.reorder_point,
                            stock_qty: product.stock_qty,
                            is_active: product.is_active,
                          }}
                          action={updateProductAction.bind(null, product.id)}
                        />
                        {product.is_active ? (
                          <ArchiveButton
                            id={product.id}
                            action={archiveProductAction}
                            label="ปิดใช้งาน"
                            confirmMessage="ปิดใช้งานสินค้านี้? ประวัติการขายจะยังคงอยู่"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="text-right">
        <Button variant="ghost" size="sm" disabled>
          ต้องการนำเข้า/ส่งออก CSV? อยู่ในแผน Phase 2
        </Button>
      </div>
    </div>
  );
}
