import { Search } from "lucide-react";

import { ArchiveButton } from "@/components/ui/archive-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ResourceDialog } from "@/components/ui/resource-dialog";
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
  archiveSupplierAction,
  createSupplierAction,
  updateSupplierAction,
} from "@/features/suppliers/actions";
import { supplierRepository } from "@/repositories/supplier_repository";

export const metadata = { title: "ผู้ขาย" };

const fields = [
  { name: "name", label: "ชื่อผู้ขาย", placeholder: "บริษัท XYZ จำกัด" },
  { name: "contact_name", label: "ผู้ติดต่อ", placeholder: "คุณสมหญิง" },
  { name: "phone", label: "โทรศัพท์", placeholder: "02-987-6543" },
  { name: "email", label: "อีเมล", type: "email" as const },
  { name: "address", label: "ที่อยู่", type: "textarea" as const, span: 2 as const },
  { name: "is_active", label: "เปิดใช้งาน", type: "checkbox" as const },
];

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const suppliers = await supplierRepository.list(q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ผู้ขาย"
        description="ซัพพลายเออร์สำหรับออกใบสั่งซื้อและรับสินค้า"
        actions={
          <ResourceDialog
            triggerLabel="เพิ่มผู้ขาย"
            title="เพิ่มผู้ขาย"
            submitLabel="บันทึกผู้ขาย"
            fields={fields}
            schema="supplier"
            defaultValues={{
              name: "",
              contact_name: "",
              phone: "",
              email: "",
              address: "",
              is_active: true,
            }}
            action={createSupplierAction}
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
              placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..."
              className="pl-9"
            />
          </form>
          <p className="text-sm text-slate-500">
            ทั้งหมด {suppliers.length} ราย
          </p>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ชื่อผู้ขาย</TableHeaderCell>
              <TableHeaderCell>ผู้ติดต่อ</TableHeaderCell>
              <TableHeaderCell>โทรศัพท์</TableHeaderCell>
              <TableHeaderCell>อีเมล</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
              <TableHeaderCell className="text-right">จัดการ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableEmpty
                colSpan={6}
                message={q ? "ไม่พบผู้ขายที่ค้นหา" : "ยังไม่มีข้อมูลผู้ขาย"}
              />
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium text-slate-900">
                    {supplier.name}
                  </TableCell>
                  <TableCell>{supplier.contact_name ?? "-"}</TableCell>
                  <TableCell>{supplier.phone ?? "-"}</TableCell>
                  <TableCell className="text-slate-500">
                    {supplier.email ?? "-"}
                  </TableCell>
                  <TableCell>
                    {supplier.is_active ? (
                      <Badge tone="success">ใช้งาน</Badge>
                    ) : (
                      <Badge>ปิดใช้งาน</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ResourceDialog
                        triggerLabel="แก้ไข"
                        title={`แก้ไข ${supplier.name}`}
                        submitLabel="บันทึกการแก้ไข"
                        variant="ghost"
                        fields={fields}
                        schema="supplier"
                        defaultValues={{
                          name: supplier.name,
                          contact_name: supplier.contact_name ?? "",
                          phone: supplier.phone ?? "",
                          email: supplier.email ?? "",
                          address: supplier.address ?? "",
                          is_active: supplier.is_active,
                        }}
                        action={updateSupplierAction.bind(null, supplier.id)}
                      />
                      {supplier.is_active ? (
                        <ArchiveButton
                          id={supplier.id}
                          action={archiveSupplierAction}
                          label="ปิดใช้งาน"
                          confirmMessage="ปิดใช้งานผู้ขายรายนี้?"
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
