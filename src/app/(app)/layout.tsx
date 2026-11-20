import { SetupNotice } from "@/components/setup-notice";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentCompany, getCurrentUser, requireProfile } from "@/lib/auth";
import { isAppConfigured } from "@/lib/env";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAppConfigured) {
    return <SetupNotice />;
  }

  const [profile, company, user] = await Promise.all([
    requireProfile(),
    getCurrentCompany(),
    getCurrentUser(),
  ]);

  return (
    <AppShell
      companyName={company?.name ?? "บริษัทของฉัน"}
      userName={profile.full_name ?? "ผู้ใช้งาน"}
      email={user?.email ?? ""}
      role={profile.role}
    >
      {children}
    </AppShell>
  );
}
