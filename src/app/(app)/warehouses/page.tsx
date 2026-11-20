import { ArchiveButton } from "@/components/ui/archive-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  ResourceDialog,
  type DialogField,
} from "@/components/ui/resource-dialog";
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
  archiveWarehouseAction,
  createWarehouseAction,
  updateWarehouseAction,
} from "@/features/warehouses/actions";
import { branchRepository } from "@/repositories/branch_repository";
import { warehouseRepository } from "@/repositories/warehouse_repository";

export const metadata = { title: "คลังสินค้า" };

export default async function WarehousesPage() {
  const [warehouses, branches] = await Promise.all([
    warehouseRepository.list(),
    branchRepository.list(),
  ]);

  const fields: DialogField[] = [
    { name: "name", label: "ชื่อคลัง", placeholder: "คลังหลัก" },
    { name: "code", label: "รหัสคลัง", placeholder: "MAIN" },
    {
      name: "branch_id",
      label: "สาขา",
      type: "select",
      options: branches.map((branch) => ({
        value: branch.id,
        label: branch.name,
      })),
    },
    { name: "is_active", label: "เปิดใช้งาน", type: "checkbox" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="คลังสินค้า"
        description="แยกสต็อกตามคลัง แต่ยังดูยอดรวมได้ที่หน้าสินค้า"
        actions={
          <ResourceDialog
            triggerLabel="เพิ่มคลัง"
            title="เพิ่มคลังสินค้า"
            submitLabel="บันทึกคลัง"
            fields={fields}
            schema="warehouse"
            defaultValues={{
              name: "",
              code: "",
              branch_id: "",
              is_active: true,
            }}
            action={createWarehouseAction}
          />
        }
      />

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ชื่อคลัง</TableHeaderCell>
              <TableHeaderCell>รหัส</TableHeaderCell>
              <TableHeaderCell>สาขา</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
              <TableHeaderCell className="text-right">จัดการ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableEmpty colSpan={5} message="ยังไม่มีคลังสินค้า" />
            ) : (
              warehouses.map((warehouse) => (
                <TableRow key={warehouse.id}>
                  <TableCell className="font-medium text-slate-900">
                    {warehouse.name}
                  </TableCell>
                  <TableCell>{warehouse.code ?? "-"}</TableCell>
                  <TableCell>{warehouse.branches?.name ?? "-"}</TableCell>
                  <TableCell>
                    {warehouse.is_active ? (
                      <Badge tone="success">ใช้งาน</Badge>
                    ) : (
                      <Badge>ปิดใช้งาน</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ResourceDialog
                        triggerLabel="แก้ไข"
                        title={`แก้ไข ${warehouse.name}`}
                        submitLabel="บันทึกการแก้ไข"
                        variant="ghost"
                        fields={fields}
                        schema="warehouse"
                        defaultValues={{
                          name: warehouse.name,
                          code: warehouse.code ?? "",
                          branch_id: warehouse.branch_id ?? "",
                          is_active: warehouse.is_active,
                        }}
                        action={updateWarehouseAction.bind(null, warehouse.id)}
                      />
                      {warehouse.is_active && warehouse.code !== "MAIN" ? (
                        <ArchiveButton
                          id={warehouse.id}
                          action={archiveWarehouseAction}
                          label="ปิดใช้งาน"
                          confirmMessage="ปิดใช้งานคลังนี้?"
                        />
                      ) : null}
                    </div>
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
