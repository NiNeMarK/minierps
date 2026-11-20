import { getCurrentProfile } from "@/lib/auth";
import { csvResponse } from "@/lib/csv";
import { reportRepository } from "@/repositories/report_repository";

export async function GET() {
  if (!(await getCurrentProfile())) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const products = await reportRepository.stock();

  return csvResponse("stock.csv", [
    ["SKU", "ชื่อสินค้า", "คงเหลือ", "จุดสั่งซื้อ", "ราคาทุน", "มูลค่า"],
    ...products.map((product) => [
      product.sku,
      product.name,
      product.stock_qty,
      product.reorder_point,
      product.cost_price,
      product.stock_qty * product.cost_price,
    ]),
  ]);
}
