import { Database, KeyRound, TerminalSquare } from "lucide-react";

/**
 * Shown when the Neon connection string or auth secret is missing so the app
 * is still usable/diagnosable after a fresh clone.
 */
export function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Database className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              MiniERP ยังไม่ได้เชื่อมต่อฐานข้อมูล
            </h1>
            <p className="text-sm text-slate-500">
              ตั้งค่า Neon Postgres และ Better Auth ก่อนเริ่มใช้งาน
            </p>
          </div>
        </div>

        <ol className="mt-8 space-y-5 text-sm text-slate-700">
          <li className="flex gap-3">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="font-medium">1. สร้างไฟล์ .env.local</p>
              <p className="mt-1 text-slate-500">
                คัดลอก <code className="rounded bg-slate-100 px-1">.env.example</code>{" "}
                เป็น <code className="rounded bg-slate-100 px-1">.env.local</code>{" "}
                แล้วใส่ <code className="rounded bg-slate-100 px-1">DATABASE_URL</code>{" "}
                จาก Neon และ <code className="rounded bg-slate-100 px-1">BETTER_AUTH_SECRET</code>{" "}
                (สุ่มอย่างน้อย 32 ตัวอักษร)
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <TerminalSquare className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="font-medium">2. รัน migration</p>
              <p className="mt-1 text-slate-500">
                รัน{" "}
                <code className="rounded bg-slate-100 px-1">
                  npm run db:migrate
                </code>{" "}
                เพื่อสร้างตารางและฟังก์ชันทั้งหมดใน Neon
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <p className="font-medium">3. รีสตาร์ท dev server</p>
              <p className="mt-1 text-slate-500">
                จากนั้นสมัครสมาชิกที่หน้า{" "}
                <code className="rounded bg-slate-100 px-1">/auth</code>{" "}
                ระบบจะสร้างบริษัท สาขาเริ่มต้น และข้อมูลอ้างอิงให้อัตโนมัติ
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}
