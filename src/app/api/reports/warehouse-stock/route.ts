import { getCurrentProfile } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { reportRepository } from "@/repositories/report_repository";

export async function GET() {
  if (!(await getCurrentProfile())) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const rows = await reportRepository.stockByWarehouse();

  return csvResponse("warehouse-stock.csv", [
    ["คลัง", "SKU", "ชื่อสินค้า", "คงเหลือ", "จุดสั่งซื้อ", "ราคาทุน", "มูลค่า"],
    ...rows.map((row) => [
      row.warehouses?.name ?? "",
      row.products?.sku ?? "",
      row.products?.name ?? "",
      row.qty,
      row.products?.reorder_point ?? 0,
      row.products?.cost_price ?? 0,
      row.qty * (row.products?.cost_price ?? 0),
    ]),
  ]);
}
