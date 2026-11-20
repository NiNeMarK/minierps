import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth";
import { formatDateOnly } from "@/lib/utils";
import { userRepository } from "@/repositories/user_repository";
import { InviteUserDialog } from "@/features/users/components/invite-user-dialog";
import { UserRowActions } from "@/features/users/components/user-row-actions";
import { roleDescriptions, roleLabels } from "@/schemas/users";
import type { UserRole } from "@/types/database";

export const metadata = { title: "ผู้ใช้และสิทธิ์" };

const roleOrder: UserRole[] = ["owner", "admin", "manager", "staff"];

export default async function UsersPage() {
  const [profile, users] = await Promise.all([
    getCurrentProfile(),
    userRepository.list(),
  ]);

  const canManage = profile?.role === "owner" || profile?.role === "admin";
  const isOwner = profile?.role === "owner";

  return (
    <div className="space-y-6">
      <PageHeader
        title="ผู้ใช้และสิทธิ์"
        description="เพิ่มผู้ใช้ในบริษัทและกำหนดบทบาทการใช้งาน"
        actions={
          canManage ? <InviteUserDialog canInviteOwner={isOwner} /> : null
        }
      />

      <Card>
        <CardHeader title="บทบาทการใช้งาน" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {roleOrder.map((role) => (
            <div key={role} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">{roleLabels[role]}</p>
                <Badge tone={role === "owner" ? "info" : "neutral"}>{role}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {roleDescriptions[role]}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="สมาชิกในบริษัท"
          description={`ทั้งหมด ${users.length} คน`}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>ชื่อ</TableHeaderCell>
              <TableHeaderCell>อีเมล</TableHeaderCell>
              <TableHeaderCell>บทบาท</TableHeaderCell>
              <TableHeaderCell>เพิ่มเมื่อ</TableHeaderCell>
              <TableHeaderCell>จัดการ</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((member) => {
              const isSelf = member.id === profile?.id;
              const rowManageable =
                canManage && (isOwner || member.role !== "owner");

              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-slate-900">
                    {member.full_name ?? member.name}
                    {isSelf ? (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        (คุณ)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-slate-600">{member.email}</TableCell>
                  <TableCell>
                    <Badge tone={member.role === "owner" ? "info" : "neutral"}>
                      {roleLabels[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-slate-500">
                    {formatDateOnly(member.created_at)}
                  </TableCell>
                  <TableCell>
                    <UserRowActions
                      userId={member.id}
                      role={member.role}
                      isSelf={isSelf}
                      canManage={rowManageable}
                      allowOwner={isOwner}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
