"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isSchemaMissing = /relation .* does not exist/i.test(error.message);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {isSchemaMissing
          ? "ยังไม่ได้รันฐานข้อมูล"
          : "เกิดข้อผิดพลาดในการโหลดข้อมูล"}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {isSchemaMissing
          ? "รันคำสั่ง npm run db:migrate เพื่อสร้างตารางใน Neon แล้วลองอีกครั้ง"
          : error.message}
      </p>
      <div className="mt-4">
        <Button onClick={reset}>ลองอีกครั้ง</Button>
      </div>
    </div>
  );
}
