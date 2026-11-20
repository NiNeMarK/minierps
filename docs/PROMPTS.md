PROMPTS

Prompt สำหรับ AI Developer (Templates & Examples)

1. Overview
- เก็บชุด prompt ที่ใช้บ่อยสำหรับงานพัฒนา เช่น การสร้าง SQL, API route, test cases, และสรุปรายงาน
- แต่ละ template ควรมี placeholders และตัวอย่าง input/expected output

2. Templates

2.1 สร้าง SQL migration สำหรับตาราง
Template:
"สร้าง SQL migration สำหรับตาราง {table_name} ด้วย fields: {fields}. ให้ใช้ PostgreSQL syntax พร้อม PK, FK ถ้าจำเป็น และตัวอย่าง index ที่แนะนำ"
Example:
"สร้าง SQL migration สำหรับตาราง products ด้วย fields: id uuid primary key, sku text, name text, unit_id uuid, cost_price numeric(14,2), sell_price numeric(14,2), created_at timestamptz"

2.2 เขียน Next.js API route (server)
Template:
"เขียน Next.js route handler ที่สร้าง sales order: ตรวจสอบ stock, สร้าง sales_order และ sales_order_lines, สร้าง stock_movement, บันทึก audit_log และส่ง event 'order.created'. ให้รวมตัวอย่าง request/response และ validation schema ด้วย Zod"

2.3 สร้าง unit/integration test
Template:
"เขียน unit test (Vitest/Jest) สำหรับฟังก์ชัน {function_name} ที่ทำ {description}. ให้ใช้ mocking สำหรับ dependencies และรวมกรณีทดสอบสำเร็จและล้มเหลว"

2.4 สรุปรายงาน (business)
Template:
"สรุปยอดขายในช่วง {from} ถึง {to} โดยแบ่งตามสินค้า 5 อันดับแรก และให้ข้อเสนอแนะ 3 ประการเพื่อเพิ่มยอดขาย" 

2.5 แปลงข้อกำหนดเป็น API contract
Template:
"จาก use case: {use_case_description} ให้สร้าง API contract (endpoint, method, request schema, response schema, HTTP codes) พร้อมตัวอย่าง request/response"

3. Prompt Guidelines
- ให้ context: schema, sample rows, และ ข้อจำกัดที่ต้องการ
- ระบุ output format: JSON, SQL, Markdown, code
- ระบุระดับ detail ที่ต้องการ (summary / detailed / full code)
- ตรวจสอบและ iterate: ถ้า output ยังไม่ตรง ให้ refine prompt โดยเพิ่มตัวอย่าง input/expected output

4. Examples (ready-to-use)
- Generate product migration
  "Create PostgreSQL migration for table products with fields: id uuid primary key, company_id uuid, sku text unique per company, name text, unit_id uuid, cost_price numeric(14,2), sell_price numeric(14,2), created_at timestamptz default now()"

- Create API route for stock check
  "Write a Next.js route handler GET /api/inventory/stock?productId= that returns current stock per warehouse. Use a Drizzle repository and include Zod validation."

(เก็บ templates เพิ่มเติมและปรับปรุงตาม feedback ของทีม โดยบันทึกตัวอย่าง prompt+response ที่ได้ผลดีไว้เป็น library)
- Sales Forecast
- Demand Forecast
- Chat Assistant
- Auto Report Summary
- OCR Invoice
- AI Product Suggestion

2. ตัวอย่าง Prompts
- "สรุปยอดขายเดือนที่ผ่านมาเป็นข้อๆ และแนะนำ 3 ประเด็นที่ควรปรับปรุง"
- "จากข้อมูลยอดขายสินค้า X ใน 12 เดือนที่ผ่านมา ทำ Sales Forecast 3 เดือนถัดไป และแสดงความเชื่อมั่นของการคาดการณ์"
- "สร้าง SQL migration สำหรับตาราง products (id, sku, name, unit_id, category_id, cost_price, sell_price, created_at)"
- "เขียนตัวอย่าง Next.js API route สำหรับสร้าง sales order พร้อมตรวจสอบ stock และบันทึก stock movement"
- "สรุปรายงาน inventory ที่มีสต็อกต่ำกว่า reorder point และสร้างรายการ Purchase Request สำหรับสินค้าเหล่านั้น"

3. Guideline ในการใช้ Prompt
- ให้ข้อมูล context (ตัวอย่าง data schema, sample rows) เพื่อผลลัพธ์ที่แม่นยำขึ้น
- ระบุ output format ที่ต้องการ (JSON, SQL, Markdown)
- กำหนดข้อจำกัดที่ชัดเจน (เช่น ไม่เปิดเผยข้อมูลส่วนบุคคล)

(เก็บ prompt templates ที่ใช้งานจริงไว้ในไฟล์นี้ และปรับปรุงตาม feedback ของทีม)