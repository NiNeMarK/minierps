import Link from "next/link";

import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { CompanySettingsForm } from "@/features/settings/components/company-settings-form";
import { ProfileNameForm } from "@/features/users/components/profile-name-form";
import {
  getCurrentCompany,
  getCurrentProfile,
  getCurrentUser,
} from "@/lib/auth";
import { roleLabels } from "@/schemas/users";

export const metadata = { title: "ตั้งค่า" };

export default async function SettingsPage() {
  const [company, profile, user] = await Promise.all([
    getCurrentCompany(),
    getCurrentProfile(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตั้งค่า"
        description="ข้อมูลบริษัท บัญชีผู้ใช้ และรหัสผ่าน"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="ข้อมูลบริษัท"
            description="เฉพาะเจ้าของหรือผู้ดูแลระบบที่แก้ไขได้"
          />
          <div className="p-5">
            <CompanySettingsForm
              defaultValues={{
                name: company?.name ?? "",
                currency: company?.currency ?? "THB",
                timezone: company?.timezone ?? "Asia/Bangkok",
              }}
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-900">
            บัญชีผู้ใช้
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">อีเมล</dt>
              <dd className="break-all font-medium text-slate-800">
                {user?.email ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">บทบาท</dt>
              <dd className="font-medium text-slate-800">
                {profile ? roleLabels[profile.role] : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">รหัสบริษัท</dt>
              <dd className="break-all font-mono text-xs text-slate-600">
                {company?.id ?? "-"}
              </dd>
            </div>
          </dl>
          {(profile?.role === "owner" || profile?.role === "admin") && (
            <Link
              href="/users"
              className="mt-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              จัดการผู้ใช้และสิทธิ์ →
            </Link>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="ชื่อที่แสดง"
            description="ชื่อที่แสดงในเมนูและเอกสาร"
          />
          <div className="p-5">
            <ProfileNameForm
              fullName={profile?.full_name ?? user?.name ?? ""}
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="เปลี่ยนรหัสผ่าน"
            description="ระบบจะยกเลิก session อื่นหลังเปลี่ยนรหัสผ่าน"
          />
          <div className="p-5">
            <ChangePasswordForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
