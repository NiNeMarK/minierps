ERD

Entity Relationship (Detailed)

Summary

Entities: companies, branches, warehouses, products, product_variants, customers, suppliers, users, roles, permissions, sales_orders, sales_order_lines, invoices, invoice_lines, purchase_orders, purchase_lines, goods_receipts, stock_movements, audit_logs, files

Key Relationships (PK / FK examples)
- companies.id (PK)
- branches.company_id -> companies.id
- warehouses.branch_id -> branches.id
- products.company_id -> companies.id
- sales_orders.company_id -> companies.id
- sales_order_lines.sales_order_id -> sales_orders.id
- stock_movements.product_id -> products.id

Example entity notes
- products (1) --- (N) product_variants (if variants used)
- products (1) --- (N) stock_movements
- customers (1) --- (N) sales_orders
- suppliers (1) --- (N) purchase_orders
- users (1) --- (N) audit_logs (as actor)

ERD Diagram
- แนะนำสร้าง diagram ด้วยเครื่องมือเช่น dbdiagram.io, draw.io, หรือ PlantUML แล้วเก็บไฟล์ใน /docs/assets/erd.png
- ตัวอย่าง dbdiagram DSL จะถูกเก็บใน docs/assets/erd.dbml (ถ้าต้องการจะสร้างให้)

Design considerations
- Include company_id and branch_id on transaction tables for proper tenant filtering
- Decide on soft-delete vs hard-delete policy per entity; prefer soft-delete for business records with audit trail
- Normalize master data but keep denormalized summary fields on transactional tables for reporting performance (e.g., store product_name on order_line)

Next steps
- Generate diagram from actual DB migrations after schema stabilizes
- Add visual ERD file into docs/assets and link it from this file
- Company -> Branch -> Warehouse
- Product -> ProductVariant/Unit -> Stock (per warehouse / lot / expire_date)
- Customer -> SalesOrder -> SalesOrderLine -> Invoice
- Supplier -> PurchaseOrder -> PurchaseLine -> GoodsReceipt -> StockMovement
- User -> Role -> Permission
- AuditLog (references user and target entity)

2. ความสัมพันธ์ (ย่อ)
- companies (1) --- (N) branches
- branches (1) --- (N) warehouses
- warehouses (1) --- (N) stock_levels
- products (1) --- (N) product_prices / product_variants
- customers (1) --- (N) sales_orders
- sales_orders (1) --- (N) sales_order_lines
- purchase_orders (1) --- (N) purchase_lines

3. Additional notes
- ใช้ foreign keys กับ ON DELETE/ON UPDATE ที่เหมาะสม
- เก็บ company_id/branch_id ในตารางธุรกรรมเพื่อผูกข้อมูลกับ tenant
- Audit log เก็บ reference id และ snapshot ของ old/new values

(ควรสร้าง diagram ERD จริงจาก schema และแนบรูป .png หรือ .svg ในไฟล์นี้ หรือในโฟลเดอร์ docs/assets)