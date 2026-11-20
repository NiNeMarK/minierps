"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfileNameAction } from "@/features/users/actions";

export function ProfileNameForm({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit() {
    setMessage(null);
    setError(null);
    setPending(true);

    try {
      const result = await updateProfileNameAction({ full_name: name });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage("บันทึกชื่อแล้ว");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Field label="ชื่อที่แสดง" htmlFor="profile-name">
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
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
          {pending ? "กำลังบันทึก..." : "บันทึกชื่อ"}
        </Button>
      </div>
    </div>
  );
}
