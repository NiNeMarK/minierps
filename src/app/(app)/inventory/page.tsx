import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import {
  ResourceDialog,
  type DialogField,
} from "@/components/ui/resource-dialog";
import { Select } from "@/components/ui/select";
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
import { warehouseRepository } from "@/repositories/warehouse_repository";

export const metadata = { title: "สต็อกสินค้า" };

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ warehouse?: string }>;
}) {
  const { warehouse } = await searchParams;

  const [warehouses, stocks, movements] = await Promise.all([
    warehouseRepository.list(),
    inventoryRepository.stocks(undefined, warehouse || undefined),
    inventoryRepository.movements(undefined, warehouse || undefined),
  ]);

  const activeWarehouses = warehouses.filter((item) => item.is_active);
  const selectedName = warehouses.find((item) => item.id === warehouse)?.name;
  const totalValue = stocks.reduce(
    (sum, row) =>
      sum + row.qty * (row.products?.cost_price ?? 0),
    0,
  );

  const adjustFields: DialogField[] = [
    {
      name: "product_id",
      label: "สินค้า",
      type: "select",
      options: Array.from(
        new Map(
          stocks.map((row) => [
            row.product_id,
            {
              value: row.product_id,
              label: `${row.products?.sku ?? ""} — ${row.products?.name ?? ""}`,
            },
          ]),
        ).values(),
      ),
    },
    {
      name: "warehouse_id",
      label: "คลังสินค้า",
      type: "select",
      options: activeWarehouses.map((item) => ({
        value: item.id,
        label: item.name,
      })),
      hint: "เลือกคลังที่จะปรับ ยอดรวมของสินค้าจะถูกอัปเดตอัตโนมัติ",
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
        description={`มูลค่าสต็อกตามราคาทุน ${formatCurrency(totalValue)}${selectedName ? ` · คลัง ${selectedName}` : ""}`}
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
              warehouse_id: warehouse ?? activeWarehouses[0]?.id ?? "",
              change_qty: "",
              reason: "",
            }}
            action={adjustStockAction}
          />
        }
      />

      <Card className="p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <Field label="กรองตามคลัง" htmlFor="warehouse-filter">
            <Select
              id="warehouse-filter"
              name="warehouse"
              defaultValue={warehouse ?? ""}
              className="w-64"
            >
              <option value="">ทุกคลัง</option>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <button type="submit" className={buttonStyles({ size: "md" })}>
            แสดง
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="สต็อกคงเหลือแยกคลัง"
          description="ยอดรวมต่อสินค้าดูได้ที่หน้าสินค้า"
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>SKU</TableHeaderCell>
              <TableHeaderCell>สินค้า</TableHeaderCell>
              <TableHeaderCell>คลัง</TableHeaderCell>
              <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
              <TableHeaderCell className="text-right">จุดสั่งซื้อ</TableHeaderCell>
              <TableHeaderCell className="text-right">มูลค่าตามทุน</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.length === 0 ? (
              <TableEmpty colSpan={7} message="ยังไม่มีสต็อกในคลังนี้" />
            ) : (
              stocks.map((row) => {
                const reorder = row.products?.reorder_point ?? 0;

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-slate-900">
                      {row.products?.sku ?? "-"}
                    </TableCell>
                    <TableCell>{row.products?.name ?? "-"}</TableCell>
                    <TableCell>{row.warehouses?.name ?? "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(row.qty)}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {formatNumber(reorder)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.qty * (row.products?.cost_price ?? 0))}
                    </TableCell>
                    <TableCell>
                      {row.qty <= reorder ? (
                        <Badge tone="warning">ควรสั่งซื้อ</Badge>
                      ) : (
                        <Badge tone="success">ปกติ</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
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
              <TableHeaderCell>คลัง</TableHeaderCell>
              <TableHeaderCell className="text-right">เปลี่ยนแปลง</TableHeaderCell>
              <TableHeaderCell className="text-right">คงเหลือ</TableHeaderCell>
              <TableHeaderCell>อ้างอิง</TableHeaderCell>
              <TableHeaderCell>หมายเหตุ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.length === 0 ? (
              <TableEmpty colSpan={7} message="ยังไม่มีการเคลื่อนไหว" />
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
                  <TableCell>{movement.warehouses?.name ?? "-"}</TableCell>
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
