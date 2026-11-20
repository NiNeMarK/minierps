import type { ZodType } from "zod";

import {
  branchInputSchema,
  customerInputSchema,
  productInputSchema,
  stockAdjustmentSchema,
  supplierInputSchema,
  warehouseInputSchema,
} from "@/schemas/master-data";

/**
 * Client-side validation schemas for the shared dialog. Keep this list small:
 * server actions always validate again with the same schemas.
 */
export const resourceSchemas = {
  product: productInputSchema,
  customer: customerInputSchema,
  supplier: supplierInputSchema,
  branch: branchInputSchema,
  warehouse: warehouseInputSchema,
  stock: stockAdjustmentSchema,
} satisfies Record<string, ZodType>;

export type ResourceSchemaKey = keyof typeof resourceSchemas;
