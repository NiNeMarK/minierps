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
  archiveCustomerAction,
  createCustomerAction,
  updateCustomerAction,
} from "@/features/customers/actions";
import { customerRepository } from "@/repositories/customer_repository";

export const metadata = { title: "ลูกค้า" };

const fields = [
  { name: "name", label: "ชื่อลูกค้า", placeholder: "บริษัท ABC จำกัด" },
  { name: "contact_name", label: "ผู้ติดต่อ", placeholder: "คุณสมชาย" },
  { name: "phone", label: "โทรศัพท์", placeholder: "02-123-4567" },
  { name: "email", label: "อีเมล", type: "email" as const },
  { name: "address", label: "ที่อยู่", type: "textarea" as const, span: 2 as const },
  { name: "is_active", label: "เปิดใช้งาน", type: "checkbox" as const },
];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await customerRepository.list(q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ลูกค้า"
        description="ฐานข้อมูลลูกค้าสำหรับออกเอกสารขาย"
        actions={
          <ResourceDialog
            triggerLabel="เพิ่มลูกค้า"
            title="เพิ่มลูกค้า"
            submitLabel="บันทึกลูกค้า"
            fields={fields}
            schema="customer"
            defaultValues={{
              name: "",
              contact_name: "",
              phone: "",
              email: "",
              address: "",
              is_active: true,
            }}
            action={createCustomerAction}
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
            ทั้งหมด {customers.length} ราย
          </p>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ชื่อลูกค้า</TableHeaderCell>
              <TableHeaderCell>ผู้ติดต่อ</TableHeaderCell>
              <TableHeaderCell>โทรศัพท์</TableHeaderCell>
              <TableHeaderCell>อีเมล</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
              <TableHeaderCell className="text-right">จัดการ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableEmpty
                colSpan={6}
                message={q ? "ไม่พบลูกค้าที่ค้นหา" : "ยังไม่มีข้อมูลลูกค้า"}
              />
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium text-slate-900">
                    {customer.name}
                  </TableCell>
                  <TableCell>{customer.contact_name ?? "-"}</TableCell>
                  <TableCell>{customer.phone ?? "-"}</TableCell>
                  <TableCell className="text-slate-500">
                    {customer.email ?? "-"}
                  </TableCell>
                  <TableCell>
                    {customer.is_active ? (
                      <Badge tone="success">ใช้งาน</Badge>
                    ) : (
                      <Badge>ปิดใช้งาน</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ResourceDialog
                        triggerLabel="แก้ไข"
                        title={`แก้ไข ${customer.name}`}
                        submitLabel="บันทึกการแก้ไข"
                        variant="ghost"
                        fields={fields}
                        schema="customer"
                        defaultValues={{
                          name: customer.name,
                          contact_name: customer.contact_name ?? "",
                          phone: customer.phone ?? "",
                          email: customer.email ?? "",
                          address: customer.address ?? "",
                          is_active: customer.is_active,
                        }}
                        action={updateCustomerAction.bind(null, customer.id)}
                      />
                      {customer.is_active ? (
                        <ArchiveButton
                          id={customer.id}
                          action={archiveCustomerAction}
                          label="ปิดใช้งาน"
                          confirmMessage="ปิดใช้งานลูกค้ารายนี้?"
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
