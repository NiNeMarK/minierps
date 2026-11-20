import * as z from "zod";

const emptyToNull = (value: unknown) =>
  value === "" || value === null || value === undefined ? null : value;

const optionalUuid = z.preprocess(
  emptyToNull,
  z.string().uuid().nullable(),
);

const optionalText = z.preprocess(
  emptyToNull,
  z.string().trim().max(500).nullable(),
);

const money = z.coerce.number().min(0, "Must be 0 or greater").default(0);
const quantity = z.coerce.number().min(0, "Must be 0 or greater").default(0);

export const productInputSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(64),
  name: z.string().trim().min(1, "Product name is required").max(200),
  category_id: optionalUuid,
  unit_id: optionalUuid,
  cost_price: money,
  sell_price: money,
  reorder_point: quantity,
  stock_qty: quantity,
  is_active: z.coerce.boolean().default(true),
});

export const customerInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  contact_name: optionalText,
  phone: optionalText,
  email: optionalText,
  address: optionalText,
  is_active: z.coerce.boolean().default(true),
});

export const supplierInputSchema = customerInputSchema;

export const branchInputSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required").max(200),
  code: optionalText,
  address: optionalText,
  phone: optionalText,
  is_active: z.coerce.boolean().default(true),
});

export const warehouseInputSchema = z.object({
  name: z.string().trim().min(1, "ชื่อคลังสินค้าจำเป็น").max(200),
  code: optionalText,
  branch_id: optionalUuid,
  is_active: z.coerce.boolean().default(true),
});

export const customerSchema = customerInputSchema;
export const supplierSchema = supplierInputSchema;
export const branchSchema = branchInputSchema;
export const warehouseSchema = warehouseInputSchema;
export const productSchema = productInputSchema;

export type ProductInput = z.input<typeof productInputSchema>;
export type ProductValues = z.output<typeof productInputSchema>;
export type CustomerInput = z.input<typeof customerInputSchema>;
export type CustomerValues = z.output<typeof customerInputSchema>;
export type SupplierInput = z.input<typeof supplierInputSchema>;
export type SupplierValues = z.output<typeof supplierInputSchema>;
export type BranchInput = z.input<typeof branchInputSchema>;
export type BranchValues = z.output<typeof branchInputSchema>;
export type WarehouseInput = z.input<typeof warehouseInputSchema>;
export type WarehouseValues = z.output<typeof warehouseInputSchema>;

export const orderLineSchema = z.object({
  product_id: z.string().uuid("Select a product"),
  qty: z.coerce.number().positive("Quantity must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Price must be 0 or greater"),
});

export const salesOrderInputSchema = z.object({
  customer_id: optionalUuid,
  branch_id: optionalUuid,
  warehouse_id: optionalUuid,
  note: optionalText,
  lines: z.array(orderLineSchema).min(1, "Add at least one product"),
});

export const purchaseOrderInputSchema = z.object({
  supplier_id: optionalUuid,
  branch_id: optionalUuid,
  warehouse_id: optionalUuid,
  note: optionalText,
  lines: z.array(orderLineSchema).min(1, "Add at least one product"),
});

export const stockAdjustmentSchema = z.object({
  product_id: z.string().uuid("Select a product"),
  warehouse_id: optionalUuid,
  change_qty: z.coerce
    .number()
    .refine((value) => value !== 0, "Quantity cannot be zero"),
  reason: optionalText,
});

export type SalesOrderInput = z.input<typeof salesOrderInputSchema>;
export type PurchaseOrderInput = z.input<typeof purchaseOrderInputSchema>;
