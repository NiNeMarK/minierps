import { ArchiveButton } from "@/components/ui/archive-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  archiveBranchAction,
  createBranchAction,
  updateBranchAction,
} from "@/features/branches/actions";
import { branchRepository } from "@/repositories/branch_repository";

export const metadata = { title: "สาขา" };

const fields = [
  { name: "name", label: "ชื่อสาขา", placeholder: "สาขาสีลม" },
  { name: "code", label: "รหัสสาขา", placeholder: "SLM" },
  { name: "phone", label: "โทรศัพท์", placeholder: "02-123-4567" },
  {
    name: "address",
    label: "ที่อยู่",
    type: "textarea" as const,
    span: 2 as const,
  },
  { name: "is_active", label: "เปิดใช้งาน", type: "checkbox" as const },
];

export default async function BranchesPage() {
  const branches = await branchRepository.list();

  return (
    <div className="space-y-6">
      <PageHeader
        title="สาขา"
        description="จัดการสาขาของบริษัท"
        actions={
          <ResourceDialog
            triggerLabel="เพิ่มสาขา"
            title="เพิ่มสาขา"
            submitLabel="บันทึกสาขา"
            fields={fields}
            schema="branch"
            defaultValues={{
              name: "",
              code: "",
              phone: "",
              address: "",
              is_active: true,
            }}
            action={createBranchAction}
          />
        }
      />

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ชื่อสาขา</TableHeaderCell>
              <TableHeaderCell>รหัส</TableHeaderCell>
              <TableHeaderCell>โทรศัพท์</TableHeaderCell>
              <TableHeaderCell>ที่อยู่</TableHeaderCell>
              <TableHeaderCell>สถานะ</TableHeaderCell>
              <TableHeaderCell className="text-right">จัดการ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.length === 0 ? (
              <TableEmpty colSpan={6} message="ยังไม่มีข้อมูลสาขา" />
            ) : (
              branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium text-slate-900">
                    {branch.name}
                  </TableCell>
                  <TableCell>{branch.code ?? "-"}</TableCell>
                  <TableCell>{branch.phone ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-500">
                    {branch.address ?? "-"}
                  </TableCell>
                  <TableCell>
                    {branch.is_active ? (
                      <Badge tone="success">ใช้งาน</Badge>
                    ) : (
                      <Badge>ปิดใช้งาน</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ResourceDialog
                        triggerLabel="แก้ไข"
                        title={`แก้ไข ${branch.name}`}
                        submitLabel="บันทึกการแก้ไข"
                        variant="ghost"
                        fields={fields}
                        schema="branch"
                        defaultValues={{
                          name: branch.name,
                          code: branch.code ?? "",
                          phone: branch.phone ?? "",
                          address: branch.address ?? "",
                          is_active: branch.is_active,
                        }}
                        action={updateBranchAction.bind(null, branch.id)}
                      />
                      {branch.is_active ? (
                        <ArchiveButton
                          id={branch.id}
                          action={archiveBranchAction}
                          label="ปิดใช้งาน"
                          confirmMessage="ปิดใช้งานสาขานี้?"
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
