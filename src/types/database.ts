export interface Company {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  created_at: Date;
}

export interface Profile {
  id: string;
  company_id: string;
  full_name: string | null;
  role: "owner" | "admin" | "manager" | "staff";
  created_at: Date;
}

export interface Branch {
  id: string;
  company_id: string;
  name: string;
  code: string | null;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface Warehouse {
  id: string;
  company_id: string;
  branch_id: string | null;
  name: string;
  code: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  created_at: Date;
}

export interface Unit {
  id: string;
  company_id: string;
  name: string;
  symbol: string;
  created_at: Date;
}

export interface Product {
  id: string;
  company_id: string;
  sku: string;
  name: string;
  category_id: string | null;
  unit_id: string | null;
  cost_price: number;
  sell_price: number;
  stock_qty: number;
  reorder_point: number;
  is_active: boolean;
  created_at: Date;
  categories?: Pick<Category, "id" | "name"> | null;
  units?: Pick<Unit, "id" | "name" | "symbol"> | null;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: Date;
}

export type Supplier = Customer;

export interface StockMovement {
  id: string;
  company_id: string;
  product_id: string;
  warehouse_id: string | null;
  change_qty: number;
  balance_after: number;
  reason: string | null;
  reference_type: string;
  reference_id: string | null;
  created_by: string | null;
  created_at: Date;
  products?: Pick<Product, "id" | "name" | "sku"> | null;
}

export interface SalesOrder {
  id: string;
  company_id: string;
  branch_id: string | null;
  customer_id: string | null;
  order_no: string;
  status: "draft" | "confirmed" | "cancelled";
  total_amount: number;
  note: string | null;
  created_by: string | null;
  created_at: Date;
  customers?: Pick<Customer, "id" | "name"> | null;
}

export interface SalesOrderLine {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  line_total: number;
  created_at: Date;
  products?: Pick<Product, "id" | "name" | "sku"> | null;
}

export interface SalesOrderWithLines extends SalesOrder {
  sales_order_lines: SalesOrderLine[];
}

export interface PurchaseOrder {
  id: string;
  company_id: string;
  branch_id: string | null;
  supplier_id: string | null;
  order_no: string;
  status: "draft" | "ordered" | "received" | "cancelled";
  total_amount: number;
  note: string | null;
  created_by: string | null;
  created_at: Date;
  received_at: Date | null;
  suppliers?: Pick<Supplier, "id" | "name"> | null;
}

export interface PurchaseOrderLine {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  line_total: number;
  created_at: Date;
  products?: Pick<Product, "id" | "name" | "sku"> | null;
}

export interface PurchaseOrderWithLines extends PurchaseOrder {
  purchase_order_lines: PurchaseOrderLine[];
}

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partial"
  | "paid"
  | "cancelled";

export type PaymentMethod = "cash" | "transfer" | "card" | "other";

export interface Payment {
  id: string;
  company_id: string;
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paid_at: Date;
  created_by: string | null;
  created_at: Date;
}

export interface Invoice {
  id: string;
  company_id: string;
  sales_order_id: string | null;
  customer_id: string | null;
  invoice_no: string;
  status: InvoiceStatus;
  issue_date: Date;
  due_date: Date | null;
  total_amount: number;
  paid_amount: number;
  note: string | null;
  created_by: string | null;
  created_at: Date;
  customers?: Pick<Customer, "id" | "name"> | null;
}

export interface InvoiceWithDetails extends Invoice {
  payments: Payment[];
  sales_orders:
    | (Pick<SalesOrder, "id" | "order_no" | "total_amount" | "status"> & {
        sales_order_lines: SalesOrderLine[];
      })
    | null;
}

export type UserRole = Profile["role"];

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  full_name: string | null;
  role: UserRole;
  created_at: Date;
}

export interface DashboardMetrics {
  monthSales: number;
  openOrders: number;
  customers: number;
  lowStock: number;
  products: number;
  stockValue: number;
  recentOrders: SalesOrder[];
  lowStockProducts: Product[];
}
