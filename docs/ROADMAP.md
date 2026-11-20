ROADMAP

แผนการพัฒนา

Overview

เอกสารนี้สรุปแผนการพัฒนา (roadmap) สำหรับ MiniERP ในระดับ milestones, phases, ความเสี่ยง และเกณฑ์การยอมรับสำหรับแต่ละ milestone

MVP Priority (สรุปฟีเจอร์ตามลำดับความสำคัญ)

Phase 1 — Core MVP (Release 0.1)
- Authentication (Email, OAuth providers)
- Dashboard (KPI, Today's Sales, Recent Activities)
- Master Data (Product, Customer, Supplier, Branch, Warehouse)
- Sales (Quotation, Sales Order, Invoice)
- Purchase (Purchase Order, Goods Receive)
- Inventory (Stock levels, Stock Movement, Adjustment)
- User & Permission (RBAC basic)

Acceptance criteria (Phase 1)
- ผู้ใช้สามารถสร้าง/อ่าน/แก้ไข/ลบ Master Data ที่สำคัญได้
- Sales → Invoice → Payment flow ทำงาน end-to-end และอัปเดต stock
- Auth + RBAC ถูกบังคับใช้ใน API และ UI
- ระบบ deploy บน Vercel + Neon และรัน smoke tests พื้นฐาน

Phase 2 — Commerce & Operations (Release 0.2)
- POS (touch UI, payment integration)
- CRM (Member, Points, Coupon, Campaign)
- Promotion engine (basic rules)
- Reports (Sales, Inventory, Customer exports)
- Notification (Email, Browser)

Acceptance criteria (Phase 2)
- POS ทำงานบน tablet/desktop และลดสต็อกได้
- Promotion/CRM ผสานกับ sales/pos
- รายงานสามารถ export เป็น Excel/PDF

Phase 3 — Enterprise & Intelligence (Release 1.0+)
- Accounting core (Daily closing, Income/Expense)
- Advanced Workflow (multi-step approvals)
- Automation rules (auto purchase, reorder)
- AI features (Forecasting, Chat Assistant, OCR)
- Integrations (e-commerce platforms, payment gateways)

Milestones & Estimated Timeline (ตัวอย่าง)
- Milestone A — Foundations (Weeks 0–8): Project scaffolding, Auth, DB schema, Core CRUD
- Milestone B — Core Flows (Weeks 9–20): Sales, Purchase, Inventory, Dashboard
- Milestone C — Commerce (Weeks 21–32): POS, CRM, Promotion
- Milestone D — Stabilize & Scale (Weeks 33–44): Reports, Accounting basics, Automation

Dependencies & Risks
- Dependent on Neon feature set and quota (compute/storage limits)
- Payment integrations subject to provider approval and testing
- RLS and multi-tenant design must be validated early to avoid data leakage

Release & Validation
- ทุก release ต้องมี:
  - Automated tests (unit + integration for critical flows)
  - Migration plan + backup
  - Runbook สำหรับ rollback

Roadmap maintenance
- Roadmap ทบทวนทุก 2 สัปดาห์ใน sprint planning
- งานสำคัญที่เปลี่ยนแปลงจะถูกบันทึกใน issue tracker และ release notes

Phase 1

- Authentication
- Dashboard
- Product
- Customer
- Supplier
- Sales
- Purchase
- Inventory
- User
- Permission

Phase 2

- POS
- CRM
- Promotion
- Reports
- Notification

Phase 3

- Accounting
- Workflow
- Automation
- AI
- Integration

Timeline & Milestones (ตัวอย่าง)

- Milestone 1 — Core MVP (Phase 1): Auth, Dashboard, Master Data, Sales/Purchase/Inventory (3 เดือน)
- Milestone 2 — Commerce features (Phase 2): POS, CRM, Promotion, Reports (3 เดือน)
- Milestone 3 — Enterprise features (Phase 3): Accounting, Workflow, Automation, Integrations (4-6 เดือน)

Long-term Goal

MiniERP เป็นแพลตฟอร์ม ERP แบบ Modular ที่สามารถรองรับธุรกิจ SME ได้หลากหลายประเภท โดยมีโครงสร้างที่ยืดหยุ่น ขยายความสามารถได้ และพร้อมเชื่อมต่อกับบริการภายนอกเพื่อรองรับการเติบโตของธุรกิจในอนาคต