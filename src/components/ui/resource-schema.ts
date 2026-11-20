import type { ZodType } from "zod";

import {
  branchInputSchema,
  customerInputSchema,
  productInputSchema,
  stockAdjustmentSchema,
  supplierInputSchema,
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
  stock: stockAdjustmentSchema,
} satisfies Record<string, ZodType>;

export type ResourceSchemaKey = keyof typeof resourceSchemas;
