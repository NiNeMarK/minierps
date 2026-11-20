import { getCurrentProfile } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { reportRepository } from "@/repositories/report_repository";
import { resolveReportRange, toDateInput } from "@/schemas/reports";

export async function GET(request: Request) {
  if (!(await getCurrentProfile())) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(request.url);
  const { from, to, fromValue, toValue } = resolveReportRange(
    url.searchParams.get("from") ?? undefined,
    url.searchParams.get("to") ?? undefined,
  );

  const invoices = await reportRepository.receivables(from, to);

  return csvResponse(`receivables_${fromValue}_${toValue}.csv`, [
    [
      "ใบแจ้งหนี้",
      "วันที่ออก",
      "ครบกำหนด",
      "ลูกค้า",
      "ยอดรวม",
      "ชำระแล้ว",
      "คงเหลือ",
      "สถานะ",
    ],
    ...invoices.map((invoice) => [
      invoice.invoice_no,
      toDateInput(invoice.issue_date),
      toDateInput(invoice.due_date),
      invoice.customers?.name ?? "ลูกค้าทั่วไป",
      invoice.total_amount,
      invoice.paid_amount,
      invoice.total_amount - invoice.paid_amount,
      invoice.status,
    ]),
  ]);
}
