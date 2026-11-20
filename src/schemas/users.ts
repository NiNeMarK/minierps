import * as z from "zod";

export const userRoleSchema = z.enum([
  "owner",
  "admin",
  "manager",
  "staff",
]);

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(120),
  email: z.email("อีเมลไม่ถูกต้อง"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .max(72, "รหัสผ่านต้องไม่เกิน 72 ตัวอักษร"),
  role: userRoleSchema.default("staff"),
});

export const updateUserRoleSchema = z.object({
  user_id: z.string().min(1, "ไม่พบผู้ใช้"),
  role: userRoleSchema,
});

export const removeUserSchema = z.object({
  user_id: z.string().min(1, "ไม่พบผู้ใช้"),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
    new_password: z
      .string()
      .min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(72, "รหัสผ่านต้องไม่เกิน 72 ตัวอักษร"),
    confirm_password: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่"),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน",
    path: ["confirm_password"],
  });

export const profileNameSchema = z.object({
  full_name: z.string().trim().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(120),
});

export type InviteUserInput = z.input<typeof inviteUserSchema>;
export type InviteUserValues = z.output<typeof inviteUserSchema>;
export type UpdateUserRoleValues = z.output<typeof updateUserRoleSchema>;
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
export type ProfileNameValues = z.output<typeof profileNameSchema>;

export const roleLabels: Record<z.infer<typeof userRoleSchema>, string> = {
  owner: "เจ้าของ",
  admin: "ผู้ดูแลระบบ",
  manager: "ผู้จัดการ",
  staff: "พนักงาน",
};

export const roleDescriptions: Record<
  z.infer<typeof userRoleSchema>,
  string
> = {
  owner: "จัดการได้ทุกอย่าง รวมถึงผู้ใช้ สิทธิ์ และตั้งค่าบริษัท",
  admin: "จัดการข้อมูลและผู้ใช้ได้ ยกเว้นการเปลี่ยนสิทธิ์เจ้าของ",
  manager: "จัดการข้อมูลหลัก เอกสารขาย จัดซื้อ และสต็อก",
  staff: "สร้างเอกสารขาย จัดซื้อ และดูสต็อก",
};
