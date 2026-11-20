MODULES

รายละเอียดทุก Module (Technical Responsibilities)

1. Master Data
- Entities: companies, branches, warehouses, products, units, categories, taxes, payment_methods, customers, suppliers, employees
- APIs: CRUD endpoints with validation; bulk import/export
- Responsibilities: canonical source for reference data; provide index endpoints for frontend (filter, search)
- Notes: soft-delete pattern, audit log on changes

2. Sales
- Submodules: quotations, sales_orders, invoices, payments, returns, credit_notes
- APIs: create/confirm/cancel sales order; invoice generation; payment recording
- Integration: inventory reservation, customer balance, promotion/discount application
- Key business logic: pricing rules, tax calculation, credit limits

3. Purchase
- Submodules: purchase_requests, purchase_orders, goods_receipts, supplier_invoices, supplier_payments
- APIs: create PO, receive goods (GR), invoice matching
- Integration: update stock on GR; cost updates on product

4. Inventory
- Services: stock service, stock valuation, transfer, adjustment, lot & expire tracking, cycle counts
- APIs: get stock levels, create adjustments, stock movement history
- Data: maintain stock_balance per (product, warehouse, lot)

5. POS
- Client: touch-optimized UI, fast product search, cart management
- Server: fast create-sale endpoint that atomically creates order, invoice and stock movements
- Integrations: payment gateway adapters, receipt printing

6. CRM
- Features: customer segmentation, points, coupons, promotions, campaigns
- APIs: manage membership, apply coupon logic during sale

7. Finance
- Basic: income/expense tracking, daily closing, cash flow report
- Future: GL, AP, AR modules with journal entries
- Integration: link invoices/payments to ledger entries

8. Reports
- Report engine: ad-hoc + scheduled reports, export to CSV/Excel/PDF
- Implementation: SQL views for complex aggregations, materialized views for heavy queries

9. Notification & Messaging
- Channel adaptors: email service, browser push, webhook sender
- Message templates and queuing for retries

10. Workflow Engine
- Configurable workflows per document type, approver chains, conditional transitions
- Persisted workflow definitions and runtime instances

11. Permission & Audit
- RBAC service, role-permission mapping, menu/action authorization checks
- Audit log service: centralized writer for changes with diff capability

12. Integration & Automation
- Connectors for external platforms (Shopee, Lazada, Stripe, PromptPay)
- Rules engine for automation (reorder, notifications)

Implementation Guidelines
- Each module should expose a service layer, repository layer, and API contract
- Keep modules decoupled to allow future independent deployment or extraction
- Provide unit tests for services and integration tests for critical flows
- Company, Branch, Warehouse, Product, Unit, Category, Tax, Payment Method, Customer, Supplier, Employee, User, Role, Permission
- รับผิดชอบข้อมูลหลักที่ใช้ร่วมกันระหว่างโมดูล

2. Sales
- Quotation, Sales Order, Invoice, POS integration, Payment, Return, Credit Note
- เชื่อมกับ Inventory (stock reservation), Customer, Pricing, Promotion

3. Purchase
- Purchase Request, Purchase Order, Goods Receive, Purchase Invoice, Supplier Payment, Return
- เชื่อมกับ Inventory, Supplier, Warehouse

4. Inventory
- Stock, Stock Movement, Transfer, Adjustment, Cycle Count, Lot, Expire Date, Barcode
- ให้บริการ API สำหรับ Stock levels, Valuation, Reorder points

5. POS
- Touch-friendly UI, Barcode scanning, QR/PromptPay, Cash/Credit card processing, Receipt printing
- ทำงานแบบ offline-friendly ในระดับ UI (caching) ถ้าจำเป็น

6. CRM
- Customer profile, Points, Coupon, Promotion, Campaign, Member management
- เชื่อมกับ Sales, POS และ Notification

7. Finance
- Income, Expense, Cash Flow, Daily Closing
- อนาคต: General Ledger (GL), Accounts Payable (AP), Accounts Receivable (AR)

8. Reports
- กำหนดและเรียกดูรายงานต่าง ๆ; รองรับ export (Excel, PDF, CSV)

9. Notification & Messaging
- Email, Browser Notification; รองรับ LINE/Telegram/LINE OA ในอนาคต

10. Workflow Engine
- สถานะเอกสารที่กำหนดได้, ขั้นตอนอนุมัติ, เงื่อนไขการอนุมัติ

11. Permission & Audit
- RBAC, Audit Log (user, time, ip, action, old/new value)

12. Integration & Automation
- Connectors: LINE OA, Facebook, Shopee, Lazada, TikTok Shop, Stripe, Omise, PromptPay, Google Calendar/Sheets
- Automation rules: Auto Purchase, Auto Stock Alert, Auto Email

(แต่ละโมดูลควรมี service layer, repository layer และ API contract ชัดเจน เพื่อให้สามารถแยก deploy/ทดสอบได้)