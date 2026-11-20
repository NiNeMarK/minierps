import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart3, Boxes, ShieldCheck } from "lucide-react";

import { SetupNotice } from "@/components/setup-notice";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { isAppConfigured } from "@/lib/env";

const features = [
  {
    icon: BarChart3,
    title: "ภาพรวมธุรกิจ",
    description: "ยอดขาย สต็อกต่ำ และเอกสารล่าสุดในที่เดียว",
  },
  {
    icon: Boxes,
    title: "สต็อกแม่นยำ",
    description: "ทุกการเคลื่อนไหวถูกบันทึก พร้อมปรับสต็อกและรับสินค้า",
  },
  {
    icon: ShieldCheck,
    title: "แยกข้อมูลตามบริษัท",
    description: "ทุกคำสั่งกรองด้วย company_id และตรวจ session ทุกครั้ง",
  },
];

export default async function HomePage() {
  if (!isAppConfigured) {
    return <SetupNotice />;
  }

  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            M
          </span>
          <span className="text-lg font-semibold">MiniERP</span>
        </div>
        <Link href="/auth" className={buttonStyles({ size: "sm" })}>
          เข้าสู่ระบบ
        </Link>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
            ERP สำหรับ SME
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            จัดการขาย สต็อก และข้อมูลหลัก
            <br />
            ในระบบเดียว
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            เริ่มต้นใช้งานฟรี สมัครแล้วระบบจะสร้างบริษัทและข้อมูลตั้งต้นให้ทันที
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth" className={buttonStyles()}>
              เริ่มใช้งาน
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth"
              className={buttonStyles({ variant: "outline" })}
            >
              มีบัญชีอยู่แล้ว
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <feature.icon className="h-6 w-6 text-indigo-600" />
              <h2 className="mt-4 font-semibold text-slate-900">
                {feature.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
