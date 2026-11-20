import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { adjustStockAction } from "@/features/inventory/actions";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { inventoryRepository } from "@/repositories/inventory_repository";
import { productRepository } from "@/repositories/product_repository";

export const metadata = { title: "สต็อกสินค้า" };

export default async function InventoryPage() {
  const [products, movements] = await Promise.all([
    productRepository.list({ activeOnly: true }),
    inventoryRepository.movements(),
  ]);

  const totalValue = products.reduce(
    (sum, product) => sum + product.stock_qty * product.cost_price,
    0,
  );

  const adjustFields: DialogField[] = [
    {
      name: "product_id",
      label: "สินค้า",
      type: "select",
      options: products.map((product) => ({
        value: product.id,
        label: `${product.sku} — ${product.name} (คงเหลือ ${product.stock_qty})`,
      })),
    },
    {
      name: "change_qty",
      label: "จำนวนที่ปรับ",
      type: "number",
      step: "0.01",
      hint: "ใส่ค่าบวกเพื่อเพิ่ม หรือค่าลบเพื่อลด",
    },
    {
      name: "reason",
      label: "เหตุผล",
      type: "textarea",
      span: 2,
      placeholder: "เช่น นับสต็อกประจำเดือน, สินค้าเสียหาย",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="สต็อกสินค้า"
        description={`มูลค่าสต็อกตามราคาทุน ${formatCurrency(totalValue)}`}
        actions={
          <ResourceDialog
            triggerLabel="ปรับสต็อก"
            title="ปรับสต็อก"
            description="ทุกรายการจะถูกบันทึกในประวัติการเคลื่อนไหว"
            submitLabel="บันทึกการปรับ"
            fields={adjustFields}
            schema="stock"
            defaultValues={{
              product_id: "",
              change_qty: "",
              reason: "",
            }}
            action={adjustStockAction}
          />
        }
      />

      <Card>
        <CardHeader title="สต็อกคงเหลือ" description="สินค้าที่เปิดใช้งาน" />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>SKU</TableHeaderCell>
              <TableHeaderCell>สินค้า</TableHeaderCell>
              <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
              <TableHeaderCell className="text-right">จุดสั่งซื้อ</TableHeaderCell>
              <TableHeaderCell className="text-right">มูลค่าตามทุน</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableEmpty colSpan={6} message="ยังไม่มีสินค้า" />
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-slate-900">
                    {product.sku}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(product.stock_qty)}
                  </TableCell>
                  <TableCell className="text-right text-slate-500">
                    {formatNumber(product.reorder_point)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(
                      product.stock_qty * product.cost_price,
                    )}
                  </TableCell>
                  <TableCell>
                    {product.stock_qty <= product.reorder_point ? (
                      <Badge tone="warning">ควรสั่งซื้อ</Badge>
                    ) : (
                      <Badge tone="success">ปกติ</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card>
        <CardHeader
          title="ประวัติการเคลื่อนไหว"
          description="200 รายการล่าสุด"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>วันที่</TableHeaderCell>
              <TableHeaderCell>สินค้า</TableHeaderCell>
              <TableHeaderCell className="text-right">เปลี่ยนแปลง</TableHeaderCell>
              <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
              <TableHeaderCell>อ้างอิง</TableHeaderCell>
              <TableHeaderCell>หมายเหตุ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.length === 0 ? (
              <TableEmpty colSpan={6} message="ยังไม่มีการเคลื่อนไหว" />
            ) : (
              movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDate(movement.created_at)}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-800">
                      {movement.products?.name ?? "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {movement.products?.sku}
                    </p>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      movement.change_qty > 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {movement.change_qty > 0 ? "+" : ""}
                    {formatNumber(movement.change_qty)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(movement.balance_after)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {movement.reference_type}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-500">
                    {movement.reason ?? "-"}
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
