"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/action-result";
import { requireProfile } from "@/lib/auth";
import { formatDbError, parseWith } from "@/lib/validation";
import { userRepository } from "@/repositories/user_repository";
import {
  inviteUserSchema,
  profileNameSchema,
  removeUserSchema,
  updateUserRoleSchema,
} from "@/schemas/users";

async function requireManager() {
  const profile = await requireProfile();

  if (profile.role !== "owner" && profile.role !== "admin") {
    return null;
  }

  return profile;
}

export async function inviteUserAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireManager();
  if (!actor) return { ok: false, error: "เฉพาะเจ้าของหรือผู้ดูแลระบบเท่านั้น" };

  const parsed = parseWith(inviteUserSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  if (parsed.data.role === "owner" && actor.role !== "owner") {
    return { ok: false, error: "เฉพาะเจ้าของเท่านั้นที่ตั้งสิทธิ์เจ้าของได้" };
  }

  try {
    const id = await userRepository.invite(parsed.data);

    revalidatePath("/users");
    revalidatePath("/settings");

    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function updateUserRoleAction(
  input: unknown,
): Promise<ActionResult> {
  const actor = await requireManager();
  if (!actor) return { ok: false, error: "เฉพาะเจ้าของหรือผู้ดูแลระบบเท่านั้น" };

  const parsed = parseWith(updateUserRoleSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await userRepository.updateRole(parsed.data.user_id, parsed.data.role);

    revalidatePath("/users");
    revalidatePath("/settings");

    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function removeUserAction(input: unknown): Promise<ActionResult> {
  const actor = await requireManager();
  if (!actor) return { ok: false, error: "เฉพาะเจ้าของหรือผู้ดูแลระบบเท่านั้น" };

  const parsed = parseWith(removeUserSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await userRepository.remove(parsed.data.user_id);

    revalidatePath("/users");
    revalidatePath("/settings");

    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}

export async function updateProfileNameAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = parseWith(profileNameSchema, input);
  if (!parsed.success) return { ok: false, error: parsed.error };

  try {
    await userRepository.updateName(parsed.data.full_name);

    revalidatePath("/", "layout");
    revalidatePath("/settings");

    return { ok: true };
  } catch (error) {
    return { ok: false, error: formatDbError(error) };
  }
}
