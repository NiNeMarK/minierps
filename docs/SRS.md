SRS

Software Requirement Specification

1. Vision

สร้างระบบ MiniERP ที่ใช้งานง่าย ขยายได้ และรองรับธุรกิจ SME หลายประเภท โดยออกแบบให้เป็นโมดูลที่เปิด/ปิดได้ และตั้งค่าผ่านหน้า Admin (Configuration First, Low Code Configuration)

2. Actors

- Admin: ตั้งค่า system-wide, manage users, roles, modules
- Manager: ดูรายงาน, อนุมัติเอกสาร, ตั้งค่าระดับสาขา
- Sales/Clerk: สร้างใบเสนอราคา, ขายสินค้า, สร้าง invoice
- Warehouse Staff: รับของเข้า/เบิกของ, ทำ stock adjustments
- Accountant: ตรวจสอบรายการเงิน, daily closing
- External System: Payment gateway, e-commerce platforms

3. Use Cases (หลัก)

3.1 Authentication & Authorization
- Login via Email/OAuth
- Password reset
- Role-based access control for menus and actions

3.2 Master Data Management
- CRUD for Product, Customer, Supplier, Branch, Warehouse, Unit, Category, Tax
- Versioning/audit for critical master data

3.3 Sales Flow
- Create Quotation → Convert to Sales Order → Reserve stock → Create Invoice → Record Payment → Complete
- Partial shipments and partial payments supported

3.4 POS Flow
- Quick product selection, barcode scanning, multi-payment support, immediate stock decrement
- Offline UI caching (local) with conflict resolution strategy

3.5 Purchase Flow
- Purchase Request → Purchase Order → Goods Receive → Update stock & cost
- Supplier Invoice and payment reconciliation

3.6 Inventory Management
- Track stock per warehouse/lot/expire_date
- Stock movements with reasons (transfer/adjustment/receive/issue)
- Cycle counts and reconciliation

3.7 Reports
- Ad-hoc and scheduled reports (Sales, Inventory, Profit, Purchase)
- Export to CSV/Excel/PDF

3.8 Notifications & Automation
- Email/Browser notifications for events (low stock, pending approval)
- Automation rules engine for auto purchase & alerts (future)

4. Functional Requirements (detailed examples)

4.1 Products
- Fields: id (UUID), sku, name, description, unit_id, category_id, cost_price, sell_price, has_lot, has_expire_date, created_at, updated_at
- API: GET /api/products, POST /api/products, PUT /api/products/:id
- Business rule: product SKU unique within company

4.2 Sales Orders
- Header: id, company_id, branch_id, customer_id, status, total_amount, tax_amount, created_by, created_at
- Lines: product_id, qty, unit_price, discount, line_total
- Status transitions controlled by workflow engine

4.3 Stock Movements
- Record every stock-affecting action with references to source (sales_order, goods_receipt, adjustment)
- Fields: id, product_id, warehouse_id, lot, expire_date, change_qty(+/-), reason, reference_type, reference_id, balance_after, created_at

5. Non-Functional Requirements

- Performance: list pages should respond < 300ms for typical page size with appropriate indexes and pagination
- Scalability: support horizontal scaling of frontend; DB scaling as needed
- Security: TLS mandatory, RLS policies for tenant isolation
- Availability: target 99.9% for frontend; backups and monitoring in place
- Maintainability: modular code, tests, documented APIs

6. Data Requirements

- Retention policy for logs and audit: keep 1 year online, archive older to cold storage
- Backup frequency: daily snapshot, weekly full backup

7. Acceptance Criteria (examples)

- End-to-end sales transaction reduces stock and generates corresponding invoice and audit log
- Role without create permission cannot create resources in protected endpoints
- Migration scripts applied without data loss in test restore

8. Traceability

- Map each high-level requirement to user stories/issues in tracker for implementation and testing

(ไฟล์นี้สามารถขยายเป็นชุด use cases / sequence diagrams / acceptance test cases สำหรับแต่ละโมดูลเพิ่มเติมตามลำดับความสำคัญ)

สร้างระบบ MiniERP ที่ใช้งานง่าย ขยายได้ และรองรับธุรกิจ SME หลายประเภท โดยออกแบบให้เป็นโมดูลที่เปิด/ปิดได้ และตั้งค่าผ่านหน้า Admin (Configuration First, Low Code Configuration)

2. Scope

ระบบครอบคลุมโมดูลหลัก: Master Data, Sales, Purchase, Inventory, POS, CRM, Finance, Reports, Notification, Workflow, Permission, Audit Log, File Management, Search Engine, Integration

3. Functional Requirements (ย่อ)

- Master Data: Company, Branch, Warehouse, Product, Customer, Supplier, Employee, Unit, Category, Tax, Payment Method, User, Role, Permission
- Sales: Quotation → Sales Order → Invoice → Payment → Return → Credit Note
- Purchase: Purchase Request → Purchase Order → Goods Receive → Purchase Invoice → Supplier Payment
- Inventory: Stock, Stock Movement, Transfer, Adjustment, Cycle Count, Lot, Expire Date, Barcode
- POS: Touch screen, Barcode, QR/PromptPay, Cash/Credit card, Receipt
- CRM: Points, Coupons, Promotion, Campaign, Member
- Finance: Income, Expense, Cash Flow, Daily Closing; future GL/AP/AR
- Reports: Export to Excel/PDF/CSV; Sales/Product/Customer/Inventory/Profit/Purchase reports
- Notification: Email, Browser Notification; future LINE/Telegram integrations
- Workflow: Document statuses (Draft → Pending → Approved → Completed → Cancelled) and configurable workflows
- Permission: RBAC — Role → Permission → Menu → Action (View/Create/Edit/Delete/Approve/Export)
- Audit Log: Record user, time, IP, action, old/new values

4. Non-Functional Requirements

- Responsive (Desktop/Tablet/Mobile)
- Fast and scalable
- Secure (authentication, RLS, encryption in transit & at rest where applicable)
- Offline cache for parts of UI where beneficial
- SEO for public pages
- Accessibility
- Clean, reusable, testable code
- CI/CD ready

5. Constraints & Assumptions

- Backend: Neon Postgres + Drizzle ORM, Better Auth sessions
- Frontend: Next.js, TypeScript, TailwindCSS
- Deployment: Vercel for the app; Neon for the database

6. Acceptance Criteria (ตัวอย่าง)

- Core CRUD flows for Master Data and Sales/Inventory work end-to-end
- Auth and RBAC enforced across APIs
- Key reports can be exported to Excel/PDF
- Basic POS flow functional on tablet/mobile touch screen

(รายละเอียดเชิงเทคนิคและ use case สามารถเติมเพิ่มในแต่ละโมดูลต่อไป)