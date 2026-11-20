# MiniERP

ระบบ ERP ขนาดเล็กสำหรับ SME สร้างด้วย Next.js 16 (App Router) + Neon Postgres
ครอบคลุมงานขาย สต็อก จัดซื้อ ใบแจ้งหนี้ ผู้ใช้ และรายงาน

## Features

- Authentication: สมัคร / เข้าสู่ระบบ / ออกจากระบบ ด้วย Better Auth (email + password)
- Multi-tenant: ข้อมูลทุกตารางแยกตาม `company_id` และทุก query ถูกกรองฝั่งเซิร์ฟเวอร์
- สร้างบริษัท + สาขา + หน่วยนับ + หมวดหมู่เริ่มต้นอัตโนมัติเมื่อสมัคร
- Master data: สินค้า, ลูกค้า, ผู้ขาย, สาขา (เพิ่ม / แก้ไข / ปิดใช้งาน / ค้นหา)
- Inventory: สต็อกคงเหลือ, ปรับสต็อก, ประวัติการเคลื่อนไหวทุกครั้ง
- Multi-warehouse: แยกสต็อกต่อคลัง, เลือกคลังตอนขาย/สั่งซื้อ/ปรับสต็อก,
  รายงานสต็อกแยกคลัง (ยอดรวมของสินค้ายังดูได้ที่หน้าสินค้า)
- Sales: สร้างเอกสารขายหลายรายการ, ตัดสต็อกแบบ transactional ผ่าน Postgres function
- Purchases: ใบสั่งซื้อ, รับสินค้าเข้าสต็อก
- Dashboard: ยอดขายเดือนนี้, เอกสารล่าสุด, สินค้าใกล้หมด, มูลค่าสต็อก
- Invoice & Payment: ออกใบแจ้งหนี้จากเอกสารขาย, รับชำระหลายครั้ง,
  อัปเดตสถานะอัตโนมัติ (issued → partial → paid)
- User management: เชิญผู้ใช้เข้าบริษัท, กำหนดบทบาท owner/admin/manager/staff,
  เปลี่ยนชื่อที่แสดง, เปลี่ยนรหัสผ่านของตัวเอง
- Reports: รายงานขาย/จัดซื้อ/สต็อก/ลูกหนี้ พร้อมส่งออก CSV (รองรับภาษาไทยใน Excel)
- Company settings: ชื่อบริษัท, สกุลเงิน, เขตเวลา

## Tech stack

- Next.js 16 (App Router, Proxy, Server Actions, Turbopack)
- React 19 + TypeScript (strict)
- Tailwind CSS 4
- Neon Postgres + Drizzle ORM (`@neondatabase/serverless` HTTP driver)
- Better Auth (session เก็บใน Postgres ผ่าน Drizzle adapter)
- Zod 4 + React Hook Form
- Lucide icons

## Getting started

1. ติดตั้ง dependencies

   ```bash
   npm install
   ```

2. สร้างโปรเจกต์ Neon แล้วคัดลอก connection string มาใส่ `.env.local`

   ```bash
   cp .env.example .env.local
   ```

   ```env
   DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   BETTER_AUTH_SECRET=<random 32-byte secret>
   BETTER_AUTH_URL=http://localhost:3000
   ```

   สร้าง secret ด้วย:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

3. รัน migration

   ```bash
   npm run db:migrate
   ```

   ไฟล์ใน `drizzle/` สร้างตารางทั้งหมด (รวมตาราง auth ของ Better Auth),
   trigger สร้างบริษัทเมื่อสมัครสมาชิก, ฟังก์ชันเอกสารขาย/จัดซื้อ/ปรับสต็อก
   และ constraint ทางธุรกิจ

4. เริ่ม dev server

   ```bash
   npm run dev
   ```

5. เปิด http://localhost:3000 แล้วสมัครสมาชิกที่ `/auth`

> หากยังไม่ตั้งค่า env ตัวแอปจะแสดงหน้า setup แทนการ crash

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | รัน dev server |
| `npm run build` | production build |
| `npm run start` | รัน production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | สร้าง migration ใหม่จาก `src/db/schema.ts` |
| `npm run db:migrate` | รัน migration กับ Neon |
| `npm run db:push` | sync schema โดยตรง (ใช้เฉพาะ dev) |
| `npm run db:studio` | เปิด Drizzle Studio |

## โครงสร้างโปรเจกต์

```
src/
  app/
    (app)/            # protected routes + app shell
      dashboard/
      products/
      customers/
      suppliers/
      branches/
      inventory/
      warehouses/
      sales/[id]/
      purchases/[id]/
      invoices/
      invoices/[id]/
      users/
      reports/
      settings/
    api/auth/         # Better Auth route handler
    api/reports/      # CSV export (sales/purchases/stock/warehouse-stock/receivables)
    auth/             # login / register
  components/
    layout/           # sidebar + shell
    orders/           # sales/purchase order dialog
    ui/               # design system primitives
  db/                 # Drizzle schema, connection, query helpers
  features/           # server actions + feature components
  lib/                # auth guard, env, validation, utils
  repositories/       # data access (server only)
  schemas/            # zod schemas (shared client/server)
  types/              # domain types
  proxy.ts            # route protection (Next.js 16 Proxy)
drizzle/              # SQL migrations generated/curated by Drizzle Kit
docs/                 # product & technical documentation
```

## Business rules ที่บังคับในฐานข้อมูล

- สร้างเอกสารขาย: ตรวจสต็อกและตัดสต็อกใน transaction เดียว
  (`create_sales_order`); ถ้าสินค้าใดไม่พอจะ rollback ทั้งเอกสาร
- รับสินค้าจากใบสั่งซื้อ: เพิ่มสต็อกและบันทึก movement (`receive_purchase_order`)
- ปรับสต็อก: บันทึก movement พร้อมยอดคงเหลือหลังปรับ (`adjust_stock`)
- สต็อกแยกคลัง: ทุกการขาย/รับของ/ปรับสต็อกอัปเดต `product_stocks` ของคลังที่เลือก
  และ `products.stock_qty` (ยอดรวม) ใน transaction เดียว; ตรวจสต็อกจากคลังที่เลือก
- ออกใบแจ้งหนี้: หนึ่งใบต่อเอกสารขาย อัปเดต `paid_amount` และสถานะ
  ผ่าน `record_invoice_payment`; ห้ามรับชำระเกินยอดคงเหลือ
- เชิญผู้ใช้: สร้าง auth user + account + profile ใน transaction เดียว
  (`invite_company_user`) โดยไม่เปลี่ยน session ของผู้ดูแลระบบที่กำลังใช้งาน
- ทุก query ของ repository กรองด้วย `company_id` จาก session และตรวจสิทธิ์ซ้ำ
  ใน server action
- การลบข้อมูลหลักใช้การปิดใช้งาน (soft archive) เพื่อรักษาประวัติเอกสาร

## สถานะและงานถัดไป

- คู่มือผู้ใช้ (พร้อมภาพหน้าจอ): [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md)
- สถานะการพัฒนา: [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)

สิ่งที่ยังไม่อยู่ในรอบนี้: หน้าเชิญผู้ใช้แบบส่งอีเมล, รายงาน PDF/Excel,
และชุดทดสอบอัตโนมัติ
