"use server";

import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/better-auth";
import { isAppConfigured } from "@/lib/env";
import type { ActionResult } from "@/lib/action-result";
import { parseWith } from "@/lib/validation";
import { changePasswordSchema } from "@/schemas/users";
import { LoginSchema, RegisterSchema } from "./schema";

const notConfigured = { ok: false, error: "ยังไม่ได้ตั้งค่าฐานข้อมูล" } as const;

export async function loginAction(input: unknown): Promise<ActionResult> {
  if (!isAppConfigured) return notConfigured;

  const parsed = parseWith(LoginSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    return { ok: false, error: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function registerAction(
  input: unknown,
): Promise<ActionResult<{ needsConfirmation: boolean }>> {
  if (!isAppConfigured) return notConfigured;

  const parsed = parseWith(RegisterSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await auth.api.signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.fullName,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      if (/already exists|already registered/i.test(error.message)) {
        return { ok: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };
      }

      return {
        ok: false,
        error: error.message || "สมัครสมาชิกไม่สำเร็จ",
      };
    }

    return { ok: false, error: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function changePasswordAction(
  input: unknown,
): Promise<ActionResult> {
  if (!isAppConfigured) return notConfigured;

  const parsed = parseWith(changePasswordSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.current_password,
        newPassword: parsed.data.new_password,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      if (/invalid password/i.test(error.message)) {
        return { ok: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
      }

      return { ok: false, error: error.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ" };
    }

    return { ok: false, error: "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่" };
  }

  return { ok: true };
}

export async function logoutAction() {
  if (isAppConfigured) {
    try {
      await auth.api.signOut({ headers: await headers() });
    } catch {
      // Already signed out or the session expired: continue to /auth.
    }
  }

  revalidatePath("/", "layout");
  redirect("/auth");
}
