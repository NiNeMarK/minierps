import { redirect } from "next/navigation";

import { SetupNotice } from "@/components/setup-notice";
import { AuthTabs } from "@/features/auth/components/auth-tabs";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { isAppConfigured } from "@/lib/env";

export const metadata = { title: "เข้าสู่ระบบ" };

export default async function AuthPage() {
  if (!isAppConfigured) {
    return <SetupNotice />;
  }

  const user = await getCurrentUser();
  if (user) {
    const profile = await getCurrentProfile();
    if (profile) redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            M
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">MiniERP</h1>
          <p className="mt-1 text-sm text-slate-500">
            ระบบจัดการธุรกิจสำหรับ SME
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <AuthTabs />
        </div>
      </div>
    </div>
  );
}
