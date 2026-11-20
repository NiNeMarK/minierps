"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerAction } from "../actions";
import { RegisterSchema, type RegisterInput } from "../schema";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        setError(null);
        setNotice(null);
        const result = await registerAction(values);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        if (result.data?.needsConfirmation) {
          setNotice(
            "สมัครสำเร็จ กรุณายืนยันอีเมลจากลิงก์ที่ส่งไป แล้วกลับมาเข้าสู่ระบบ",
          );
        }
      })}
    >
      <Field
        label="ชื่อ-นามสกุล"
        htmlFor="register-name"
        error={errors.fullName?.message}
      >
        <Input
          id="register-name"
          autoComplete="name"
          placeholder="Somchai Jaidee"
          {...register("fullName")}
        />
      </Field>

      <Field
        label="อีเมล"
        htmlFor="register-email"
        error={errors.email?.message}
      >
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          {...register("email")}
        />
      </Field>

      <Field
        label="รหัสผ่าน"
        htmlFor="register-password"
        error={errors.password?.message}
        hint="อย่างน้อย 8 ตัวอักษร"
      >
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register("password")}
        />
      </Field>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}
      </Button>

      <p className="text-center text-xs text-slate-500">
        การสมัครจะสร้างบริษัท สาขาเริ่มต้น และข้อมูลอ้างอิงให้อัตโนมัติ
      </p>
    </form>
  );
}
