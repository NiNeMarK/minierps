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

  const { orders } = await reportRepository.purchases(from, to);

  return csvResponse(`purchases_${fromValue}_${toValue}.csv`, [
    ["เลขที่เอกสาร", "วันที่", "ผู้ขาย", "สถานะ", "ยอดรวม"],
    ...orders.map((order) => [
      order.order_no,
      toDateInput(order.created_at),
      order.suppliers?.name ?? "ไม่ระบุผู้ขาย",
      order.status,
      order.total_amount,
    ]),
  ]);
}
