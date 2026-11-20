"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { receivePurchaseOrderAction } from "@/features/purchases/actions";

export function ReceiveButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!window.confirm("ยืนยันรับสินค้าทั้งหมดเข้าสต็อก?")) return;

    setPending(true);
    setError(null);

    try {
      const result = await receivePurchaseOrderAction(id);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={onClick} disabled={pending}>
        {pending ? "กำลังรับสินค้า..." : "รับสินค้าเข้าสต็อก"}
      </Button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
