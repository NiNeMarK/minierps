"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/features/auth/actions";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setMessage(null);
    setError(null);
    setPending(true);

    try {
      const result = await changePasswordAction({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("เปลี่ยนรหัสผ่านแล้ว");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="รหัสผ่านปัจจุบัน" htmlFor="current-password">
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </Field>

      <Field
        label="รหัสผ่านใหม่"
        htmlFor="new-password"
        hint="อย่างน้อย 8 ตัวอักษร"
      >
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </Field>

      <Field label="ยืนยันรหัสผ่านใหม่" htmlFor="confirm-password">
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </Field>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <div className="border-t border-slate-100 pt-4">
        <Button onClick={onSubmit} disabled={pending}>
          {pending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
        </Button>
      </div>
    </div>
  );
}
