# สถานะการพัฒนา (Implementation Status)

อัปเดตล่าสุด: 20 พฤศจิกายน 2026

## Phase 1 — Core MVP

| ฟีเจอร์ | สถานะ | รายละเอียด |
| --- | --- | --- |
| Authentication | ✅ | Email/password ผ่าน Better Auth, session cookie, protected routes ที่ `src/proxy.ts` |
| Dashboard | ✅ | KPI เดือนนี้, เอกสารขายล่าสุด, สินค้าใกล้หมด, มูลค่าสต็อก |
| Master Data — Product | ✅ | CRUD + ค้นหา + opening stock + ปิดใช้งาน |
| Master Data — Customer | ✅ | CRUD + ค้นหา + ปิดใช้งาน |
| Master Data — Supplier | ✅ | CRUD + ค้นหา + ปิดใช้งาน |
| Master Data — Branch | ✅ | CRUD + ปิดใช้งาน |
| Sales Order | ✅ | สร้างเอกสารหลายรายการ, ตัดสต็อกแบบ atomic, หน้ารายละเอียด |
| Purchase Order | ✅ | สร้างใบสั่งซื้อ, รับสินค้าเข้าสต็อก, หน้ารายละเอียด |
| Inventory | ✅ | สต็อกคงเหลือ, ปรับสต็อก, ประวัติ movement |
| Company Settings | ✅ | ชื่อบริษัท/สกุลเงิน/เขตเวลา (owner, admin) |
| Tenant isolation | ✅ | ทุก query/repository กรอง `company_id` จาก session; server actions ตรวจ auth ซ้ำ |
| Database migrations | ✅ | Drizzle Kit (`drizzle/0000`–`0005`) |

## Phase 2 — invoicing, users, reports

| ฟีเจอร์ | สถานะ | รายละเอียด |
| --- | --- | --- |
| Invoice | ✅ | ออกใบแจ้งหนี้จากเอกสารขายได้ครั้งเดียว, หน้าแสดงรายการและสถานะ |
| Payment | ✅ | รับชำระหลายครั้ง, ตรวจยอดเกิน, อัปเดตสถานะ issued → partial → paid |
| User management | ✅ | เพิ่มผู้ใช้ในบริษัท, เปลี่ยนบทบาท, ลบผู้ใช้, ป้องกัน owner คนสุดท้าย |
| Role-based access | 🟡 | owner/admin จัดการผู้ใช้และตั้งค่าบริษัท; manager/staff ใช้ฟีเจอร์ปฏิบัติการได้; ยังไม่มี matrix แบบละเมนู |
| Change password | ✅ | เปลี่ยนรหัสผ่านตัวเอง พร้อมยกเลิก session อื่น |
| Reports | ✅ | รายงานขาย/จัดซื้อ/สต็อก/ลูกหนี้ตามช่วงเวลา |
| CSV export | ✅ | ส่งออก 5 รายงานเป็น CSV พร้อม BOM ภาษาไทย |
| Multi-warehouse | ✅ | แยกสต็อกต่อคลัง (`product_stocks`), เลือกคลังในเอกสารขาย/สั่งซื้อ/ปรับสต็อก, รายงานแยกคลัง |
| Email invitation | ⬜ | ยังไม่ได้ส่งอีเมลเชิญแบบมีลิงก์ตั้งรหัสผ่าน (ตอนนี้แจ้งรหัสผ่านให้เอง) |

## สถาปัตยกรรมข้อมูล

- **Neon Postgres** เป็นฐานข้อมูลเดียว (connection string ใน `DATABASE_URL`)
- **Drizzle ORM** ใช้ `@neondatabase/serverless` HTTP driver
- **Better Auth** เก็บ `user`, `session`, `account`, `verification` ใน Neon
  ผ่าน Drizzle adapter
- งานที่ต้อง atomic ทำใน Postgres function (ไม่ใช้ interactive transaction
  เพราะ HTTP driver ไม่รองรับ): `create_sales_order`, `create_purchase_order`,
  `receive_purchase_order`, `adjust_stock`, `create_invoice_for_order`,
  `record_invoice_payment`, `invite_company_user`
- สต็อกแยกเก็บใน `product_stocks` (ต่อ product + warehouse) และมี
  `products.stock_qty` เป็นยอดรวม; ทุกการเคลื่อนไหวอัปเดตทั้งสองตารางและเขียน
  `stock_movements.warehouse_id` ใน transaction เดียว
- ทุกตารางธุรกิจมี `company_id`; repository รับค่าจาก `requireProfile()`/
  `requireTenant()` และใส่เงื่อนไขทุกครั้ง (ไม่มี RLS ของ Supabase แล้ว)

## ยังไม่ทำ (แนะนำลำดับถัดไป)

1. **User invitation แบบอีเมล** — ลิงก์ยืนยัน + ตั้งรหัสผ่านเอง + หมดอายุ
2. **Reports** — PDF/Excel, กรองตามลูกค้า/สินค้า/สาขา
3. **Automated tests** — unit test ของ schema/repository และ integration test ของ RPC
4. **Audit log UI** — บันทึกการเปลี่ยนแปลงสิทธิ์/การเงิน
5. **POS / CRM / Promotion** — Phase 2 ตาม roadmap

## คู่มือที่เกี่ยวข้อง

- [คู่มือผู้ใช้ฉบับเต็ม (พร้อมภาพหน้าจอ)](USER_GUIDE.md)
- [โครงสร้างฐานข้อมูล](DATABASE.md)
- [คู่มือ deploy](DEPLOYMENT.md)

## หมายเหตุทางเทคนิค

- Next.js 16 ใช้ `proxy.ts` แทน `middleware.ts`; `cookies()`/`headers()` เป็น async
- Better Auth ใช้ `nextCookies()` plugin เพื่อเขียน session cookie จาก server action
- `invite_company_user` สร้าง user ตรง ๆ ใน Neon เพราะ `signUpEmail` จะทำการ
  sign-in ให้ผู้ใช้ใหม่และไปเขียนทับ session ของผู้ดูแลระบบ
- Trigger `on_auth_user_created` สร้างบริษัทให้ user ใหม่; ฟังก์ชันเชิญย้าย
  profile ไปบริษัทเป้าหมายแล้วลบบริษัทชั่วคราวที่ trigger สร้าง
- Server Actions ตรวจสอบข้อมูลด้วย Zod ซ้ำเสมอ แม้ฝั่ง client validate แล้ว
- ค่าเงินใช้ `numeric(14,2)` และ Drizzle แปลงเป็น `number` (`mode: "number"`)
- Drizzle migration ต้องรันกับ Neon จริงก่อน deploy (`npm run db:migrate`)

## วิธีตรวจสอบก่อน deploy

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. `npm run db:migrate` กับ Neon staging
5. สมัครผู้ใช้ทดสอบ → เพิ่มสินค้า → ขาย → ตรวจสต็อกและ movement
6. ออกใบแจ้งหนี้ → รับชำระบางส่วนและเต็ม → ตรวจสถานะและยอดคงเหลือ
7. เชิญผู้ใช้ → login ด้วยบัญชีใหม่ → ตรวจว่าอยู่ในบริษัทเดียวกัน
8. เปิด `/reports` → ดาวน์โหลด CSV ทั้ง 4 ไฟล์ → ตรวจภาษาไทยใน Excel
9. ตรวจว่า query ข้ามบริษัทไม่ได้ (repository กรอง `company_id` ทุกจุด)
