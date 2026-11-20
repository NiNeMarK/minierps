"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { inviteUserAction } from "@/features/users/actions";
import { roleLabels, userRoleSchema } from "@/schemas/users";

export function InviteUserDialog({ canInviteOwner }: { canInviteOwner: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("staff");
    setError(null);
  }

  async function onSubmit() {
    setError(null);
    setPending(true);

    try {
      const result = await inviteUserAction({ name, email, password, role });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setOpen(false);
      reset();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        เพิ่มผู้ใช้
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="เพิ่มผู้ใช้"
        description="ผู้ใช้ใหม่จะเข้าใช้งานบริษัทนี้ทันทีด้วยอีเมลและรหัสผ่านที่กำหนด"
      >
        <div className="space-y-4">
          <Field label="ชื่อที่แสดง" htmlFor="invite-name">
            <Input
              id="invite-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="ชื่อ-นามสกุล"
            />
          </Field>

          <Field label="อีเมล" htmlFor="invite-email">
            <Input
              id="invite-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
            />
          </Field>

          <Field
            label="รหัสผ่านเริ่มต้น"
            htmlFor="invite-password"
            hint="อย่างน้อย 8 ตัวอักษร แจ้งให้ผู้ใช้เปลี่ยนภายหลัง"
          >
            <Input
              id="invite-password"
              type="text"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <Field label="สิทธิ์การใช้งาน" htmlFor="invite-role">
            <Select
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {userRoleSchema.options
                .filter((option) => canInviteOwner || option !== "owner")
                .map((option) => (
                  <option key={option} value={option}>
                    {roleLabels[option]}
                  </option>
                ))}
            </Select>
          </Field>

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              ยกเลิก
            </Button>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? "กำลังบันทึก..." : "เพิ่มผู้ใช้"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
