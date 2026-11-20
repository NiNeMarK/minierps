import type { BadgeTone } from "@/components/ui/badge";
import type { InvoiceStatus } from "@/types/database";

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "ฉบับร่าง",
  issued: "ออกแล้ว",
  partial: "ชำระบางส่วน",
  paid: "ชำระครบ",
  cancelled: "ยกเลิก",
};

export const invoiceStatusTones: Record<InvoiceStatus, BadgeTone> = {
  draft: "neutral",
  issued: "info",
  partial: "warning",
  paid: "success",
  cancelled: "danger",
};
