"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateCompanyAction } from "@/features/settings/actions";
import {
  companySettingsSchema,
  type CompanySettingsInput,
} from "@/schemas/company";

export function CompanySettingsForm({
  defaultValues,
}: {
  defaultValues: CompanySettingsInput;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        setMessage(null);
        setError(null);

        const result = await updateCompanyAction(values);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setMessage("บันทึกการตั้งค่าแล้ว");
      })}
    >
      <Field label="ชื่อบริษัท" htmlFor="company-name" error={errors.name?.message}>
        <Input id="company-name" {...register("name")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="สกุลเงิน"
          htmlFor="company-currency"
          error={errors.currency?.message}
          hint="รหัส 3 ตัวอักษร เช่น THB, USD"
        >
          <Input id="company-currency" maxLength={3} {...register("currency")} />
        </Field>

        <Field
          label="เขตเวลา"
          htmlFor="company-timezone"
          error={errors.timezone?.message}
        >
          <Input
            id="company-timezone"
            placeholder="Asia/Bangkok"
            {...register("timezone")}
          />
        </Field>
      </div>

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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </Button>
      </div>
    </form>
  );
}
