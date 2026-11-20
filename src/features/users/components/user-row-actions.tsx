"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  removeUserAction,
  updateUserRoleAction,
} from "@/features/users/actions";
import { roleLabels, userRoleSchema } from "@/schemas/users";
import type { UserRole } from "@/types/database";

export function UserRowActions({
  userId,
  role,
  isSelf,
  canManage,
  allowOwner,
}: {
  userId: string;
  role: UserRole;
  isSelf: boolean;
  canManage: boolean;
  allowOwner: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canManage) {
    return <span className="text-sm text-slate-600">{roleLabels[role]}</span>;
  }

  async function onChangeRole(nextRole: string) {
    setError(null);
    setPending(true);

    try {
      const result = await updateUserRoleAction({
        user_id: userId,
        role: nextRole,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onRemove() {
    if (
      !window.confirm(
        "ต้องการลบผู้ใช้นี้หรือไม่? บัญชีและ session ทั้งหมดจะถูกลบ",
      )
    ) {
      return;
    }

    setError(null);
    setPending(true);

    try {
      const result = await removeUserAction({ user_id: userId });

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
    <div className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="เปลี่ยนสิทธิ์ผู้ใช้"
        className="h-9 w-36"
        value={role}
        disabled={pending || isSelf}
        onChange={(event) => onChangeRole(event.target.value)}
      >
        {userRoleSchema.options
          .filter((option) => allowOwner || option !== "owner")
          .map((option) => (
            <option key={option} value={option}>
              {roleLabels[option]}
            </option>
          ))}
      </Select>

      {isSelf ? (
        <span className="text-xs text-slate-400">บัญชีของคุณ</span>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={onRemove}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          ลบ
        </Button>
      )}

      {error ? (
        <span className="w-full text-xs text-rose-600">{error}</span>
      ) : null}
    </div>
  );
}
