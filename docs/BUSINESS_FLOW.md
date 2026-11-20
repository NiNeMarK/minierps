BUSINESS_FLOW

Business Flow

1. Overview

ระบบออกแบบเป็น Modular — ทุกโมดูลสื่อสารผ่าน API และใช้ Master Data ร่วมกัน (Company, Branch, Warehouse, Product, Customer, Supplier)

2. Sales Flow (Detailed)

Sequence (typical)
1) สร้าง Quotation (optional)
2) สร้าง Sales Order → ตรวจสอบ stock availability (reserve stock)
3) เตรียมการจัดส่ง (pick/pack) → สร้าง Delivery/Shipment record
4) สร้าง Invoice (สามารถแปลงจาก Sales Order)
5) รับ Payment (partial/full) → อัปเดต status ของ Invoice
6) หากครบเงื่อนไข → ปิด Sales Order และลด stock ถ้ายังไม่ได้ลดก่อนหน้านี้

Transaction boundaries
- Reservation step ควรใช้ transaction เพื่อผูก stock reservation กับ sales_order_id
- Stock decrement ควรบันทึกเป็น stock_movement และเป็น atomic operation

Events
- order.created, stock.reserved, invoice.created, payment.received, order.completed
- Events ส่งไปยัง webhook หรือ message queue สำหรับ integration

3. POS Flow (Detailed)

- UI ลงรายการขายแบบ realtime
- เมื่อกดจ่าย: สร้าง sales_order + invoice ใน backend และลด stock ทันที
- รองรับ multi-payment (cash+card)
- Offline mode (UI cache): sync logic ต้องจัดการ conflict (ใช้ last-write 또는 merge rules)

4. Purchase Flow (Detailed)

- Purchase Request → Approve → Purchase Order → Goods Receive
- Goods Receive จะสร้าง stock_movement (เพิ่ม stock) และสามารถบันทึก lot/expire_date
- เมื่อบันทึก supplier invoice → ผูกกับ GR และทำ supplier payment

5. Inventory Flow (Detailed)

- Stock Movement types: RECEIVE, ISSUE, TRANSFER, ADJUSTMENT, SALE_CANCELLATION
- Cycle Count: create count session → record counted_qty → reconcile (generate adjustments)
- Stock valuation: FIFO / average cost (กำหนดค่าใน config)

6. Workflow & Approvals

- Document states: Draft → Pending → Approved → Completed → Cancelled
- Configurable approver chains: by amount threshold, by role, by branch
- Each transition logged to audit_log with user and timestamp

7. Notification & Automation

- Notification triggers: low_stock, pending_approval, payment_overdue
- Channels: email, browser push; future: LINE, Telegram
- Automation example: ถ้า stock < reorder_point → สร้าง auto purchase request (rule engine)

8. Integration patterns

- Sync vs Async: use sync API for simple lookups; emit events/webhooks for cross-system async integration
- Idempotency: external webhook handlers should be idempotent (idempotency-key)

9. Implementation notes

- ใช้ transactions สำหรับ critical flows (order/payment/stock updates)
- บันทึก audit log ทุกการเปลี่ยนแปลงที่สำคัญ
- เตรียม reconciliation jobs เพื่อตรวจสอบความสอดคล้องของ stock และบัญชีเป็นระยะๆ

ระบบออกแบบเป็น Modular — แต่ละโมดูลทำงานร่วมกันผ่าน API และ shared Master Data (Company, Branch, Warehouse, Product, Customer, Supplier)

2. ตัวอย่าง Flows (ทั่วไป)

Sales Flow
- Quotation → Sales Order → Delivery/Stock Reservation → Invoice → Payment → Completed

POS Flow
- เปิดการขายบนหน้าจอ POS → สแกนสินค้า/เลือกสินค้า → ชำระเงิน (Cash/Card/QR) → พิมพ์/บันทึก Receipt → ลดสต็อก

Purchase Flow
- Purchase Request → Purchase Order → Goods Receive (GR) → Update Stock → Purchase Invoice → Supplier Payment

Inventory Flow
- รับสินค้าเข้า (GR) → ปรับสต็อก (Adjustment/Transfer) → Cycle Count → รายงาน stock

Workflow Engine
- เอกสารมีสถานะ: Draft → Pending → Approved → Completed → Cancelled
- Workflow configurable: ผู้อนุมัติหลายขั้น, เงื่อนไขตามมูลค่า/สาขา/ประเภทเอกสาร

3. Administrative Flows

- Configuration First: ตั้งค่า VAT/Currency/Warehouse/Printer/Prefix/Unit/Category/Tax/Discount ผ่านหน้า Admin
- User & Permission: สร้าง Role → ผูก Permission → กำหนด Menu/Action

4. Notification & Automation

- แจ้งเตือนสำคัญ (Low stock, Pending approvals) ทาง Email/Browser; ขยายในอนาคตเป็น LINE/Telegram
- Automation (อนาคต): Auto Purchase, Auto Stock Alert, Auto Email/Invoice

5. Notes for Implementation

- ทุก flow ต้องบันทึก Audit Log
- ทุกการเปลี่ยนสถานะสำคัญควรเป็น transaction เพื่อให้ข้อมูลสอดคล้องกัน (ACID)
- ใช้ events/webhooks สำหรับ integration และ realtime updates