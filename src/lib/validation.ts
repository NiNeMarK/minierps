import type { ZodError, ZodType } from "zod";

export function firstZodIssue(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid input";
}

export function parseWith<T>(
  schema: ZodType<T>,
  input: unknown,
):
  | { success: true; data: T }
  | { success: false; error: string } {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: firstZodIssue(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

const dbMessages: Record<string, string> = {
  NOT_AUTHENTICATED: "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่",
  EMPTY_ORDER: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ",
  INVALID_QTY: "จำนวนต้องมากกว่า 0",
  PRODUCT_NOT_FOUND: "ไม่พบสินค้าที่เลือก",
  CUSTOMER_NOT_FOUND: "ไม่พบลูกค้าที่เลือก",
  SUPPLIER_NOT_FOUND: "ไม่พบผู้ขายที่เลือก",
  BRANCH_NOT_FOUND: "ไม่พบสาขาที่เลือก",
  WAREHOUSE_NOT_FOUND: "ไม่พบคลังสินค้าที่เลือก หรือคลังถูกปิดใช้งาน",
  ORDER_NOT_FOUND: "ไม่พบเอกสาร",
  ORDER_NOT_RECEIVABLE: "เอกสารนี้รับสินค้าแล้วหรือถูกยกเลิก",
  ORDER_NOT_INVOICEABLE: "เอกสารขายนี้ถูกยกเลิก ไม่สามารถออกใบแจ้งหนี้ได้",
  COMPANY_NOT_FOUND: "ไม่พบบริษัท",
  INVOICE_NOT_FOUND: "ไม่พบใบแจ้งหนี้",
  INVOICE_EXISTS: "เอกสารขายนี้ออกใบแจ้งหนี้แล้ว",
  INVOICE_CANCELLED: "ใบแจ้งหนี้ถูกยกเลิกแล้ว",
  INVALID_AMOUNT: "จำนวนเงินต้องมากกว่า 0",
  INVALID_PAYMENT_METHOD: "วิธีชำระเงินไม่ถูกต้อง",
  PAYMENT_EXCEEDS_BALANCE: "จำนวนเงินเกินยอดคงเหลือของใบแจ้งหนี้",
  USER_NOT_FOUND: "ไม่พบผู้ใช้",
  EMAIL_IN_USE: "อีเมลนี้ถูกใช้งานแล้ว",
  INVALID_ROLE: "สิทธิ์ผู้ใช้ไม่ถูกต้อง",
  INVALID_EMAIL: "อีเมลไม่ถูกต้อง",
  INVALID_PASSWORD: "รหัสผ่านไม่ถูกต้อง",
  NOT_AUTHORIZED: "ไม่มีสิทธิ์ดำเนินการ",
  CANNOT_MODIFY_SELF: "ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้",
  CANNOT_REMOVE_SELF: "ไม่สามารถลบบัญชีของตัวเองได้",
  LAST_OWNER: "ต้องมีเจ้าของบริษัทอย่างน้อย 1 คน",
  OWNER_PROTECTED: "ผู้ดูแลระบบไม่สามารถแก้ไขบัญชีเจ้าของได้",
  INVITE_FAILED: "เชิญผู้ใช้ไม่สำเร็จ",
};

type DatabaseError = Error & { code?: string; detail?: string };

/**
 * Converts Postgres / RPC errors into messages that are safe to show in UI.
 */
export function formatDbError(error: unknown, fallback = "บันทึกข้อมูลไม่สำเร็จ") {
  const message = error instanceof Error ? error.message : fallback;
  const code = (error as DatabaseError | null)?.code;

  if (message.startsWith("INSUFFICIENT_STOCK:")) {
    return `สต็อกสินค้า ${message.split(":")[1]} ไม่เพียงพอ`;
  }

  const key = message.trim();
  if (dbMessages[key]) return dbMessages[key];

  if (code === "23505" || message.includes("duplicate key")) {
    return "ข้อมูลซ้ำกับรายการที่มีอยู่แล้ว";
  }

  if (code === "23503" || message.includes("violates foreign key")) {
    return "ข้อมูลนี้ถูกอ้างอิงโดยเอกสารอื่น จึงไม่สามารถลบได้";
  }

  if (/relation .* does not exist/i.test(message)) {
    return "ยังไม่ได้สร้างตารางในฐานข้อมูล กรุณารัน npm run db:migrate";
  }

  return message || fallback;
}
