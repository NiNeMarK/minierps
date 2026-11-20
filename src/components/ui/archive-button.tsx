"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";

export function ArchiveButton({
  id,
  action,
  label = "Archive",
  confirmMessage = "Archive this record? Historical transactions are kept.",
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!window.confirm(confirmMessage)) return;

    setPending(true);

    try {
      const result = await action(id);

      if (!result.ok) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={pending}>
      {pending ? "..." : label}
    </Button>
  );
}
