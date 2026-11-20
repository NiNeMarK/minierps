API_SPEC

API Contract (Technical)

1. Architecture & Conventions
- API implemented as Next.js Route Handlers under app/api/*
- Use consistent request/response envelope: { ok: boolean, data?: any, error?: { code, message, details? } }
- Business logic separated into services, repositories, validators
- Use middleware for auth, validation, and rate limiting

2. Authentication & Authorization
- Authentication via Better Auth session cookie (httpOnly)
- Backend verifies the session and derives user_id/company_id server-side
- Enforce RBAC in server actions and tenant scoping in repositories

3. Pagination, Filtering, Sorting conventions
- Pagination: use page & limit or cursor-based (recommended cursor for large datasets)
- Example query params: ?page=1&limit=20&q=term&sortBy=created_at&order=desc
- Response meta: { data: [...], meta: { page, limit, total, totalPages, cursor? } }

4. Error handling
- Map validation errors to 400, auth errors to 401/403, not found to 404, server errors to 500
- Example error response:
  { "ok": false, "error": { "code": "INVALID_INPUT", "message": "Field X is required", "details": {"field":"name"} } }

5. Standard endpoints (detailed examples)

Auth
- POST /api/auth/login
  - body: { email, password }
  - success: 200 { ok: true, data: { token, user } }
- POST /api/auth/refresh
  - body: { refreshToken }

Products
- GET /api/products
  - query: ?companyId=&branchId=&q=&page=&limit=&category=
  - response: { ok: true, data: [ { id, sku, name, sell_price, stock } ], meta }
- POST /api/products
  - body: { sku, name, unit_id, category_id, sell_price, cost_price, has_lot, has_expire_date }
  - response: 201 { ok: true, data: { id } }
- GET /api/products/:id
- PUT /api/products/:id
- DELETE /api/products/:id (soft-delete)

Sales Orders
- POST /api/sales/orders
  - body: { company_id, branch_id, customer_id, lines: [{ product_id, qty, unit_price, discount }] }
  - behavior: validate stock availability or create reservation; create sales_order + lines; emit order.created event
  - response: 201 { ok: true, data: { id, status } }
- GET /api/sales/orders/:id
- POST /api/sales/orders/:id/confirm
  - transitions status and optionally create invoice

Inventory
- GET /api/inventory/stock?productId=&warehouseId=&branchId=
  - returns current stock per warehouse/lot
- POST /api/inventory/adjustments
  - body: { product_id, warehouse_id, change_qty, reason }
  - creates stock_movement and updates balances

Reports
- GET /api/reports/sales?from=&to=&groupBy=day|month|product
  - returns aggregated report and supports export query param ?export=csv

6. Webhooks & Events
- Events emitted: order.created, order.completed, invoice.paid, stock.low
- Provide /api/webhooks/external for receiving external events and validate with signature header

7. Versioning
- Start with /api/v1/..., bump major version for breaking changes and provide migration notes

8. Examples (Request/Response)
- Create product (POST /api/products)
  Request:
  {
    "sku": "P-001",
    "name": "Example Product",
    "unit_id": "uuid-unit",
    "sell_price": 120.00
  }
  Response:
  {
    "ok": true,
    "data": { "id": "uuid-product", "sku": "P-001" }
  }

- Create sales order (POST /api/sales/orders)
  Request:
  {
    "company_id":"uuid-comp",
    "branch_id":"uuid-branch",
    "customer_id":"uuid-cust",
    "lines":[{"product_id":"uuid-prod","qty":2,"unit_price":100.0}]
  }
  Response:
  {
    "ok": true,
    "data": { "id": "uuid-order", "status":"pending" }
  }

9. Security & Best Practices
- Validate and sanitize inputs; use Zod or equivalent for schema validation
- Enforce rate limits on public endpoints
- Ensure idempotency keys for external-facing create endpoints

(เอกสารนี้ควรถูกขยายด้วย contract แบบเต็มสำหรับแต่ละ resource — field-level schema, example responses, error codes และ RLS/policy ที่เกี่ยวข้อง)
- API implemented as Next.js Route Handlers under app/api/*
- Prefer REST-style endpoints (or light-weight RPC) with consistent request/response envelope
- Business logic separated into /services, /repositories, /lib

2. Authentication
- Better Auth session cookie
- Each endpoint/action validates the session and enforces role checks

3. Response format (ตัวอย่าง)
- Success: { "ok": true, "data": ... }
- Error: { "ok": false, "error": { "code": "ERR_CODE", "message": "..." } }

4. Error handling
- ใช้ HTTP status codes ที่สอดคล้อง (200/201, 400, 401, 403, 404, 500)
- ให้รายละเอียดข้อผิดพลาดแบบไม่เปิดเผยข้อมูลความลับ

5. ตัวอย่าง Endpoints (ย่อ)
- Auth
  - POST /api/auth/login — body: { email, password } → { token, user }
  - POST /api/auth/logout
- Products
  - GET /api/products?branchId=&q=&page=&limit=
  - POST /api/products
  - GET /api/products/:id
  - PUT /api/products/:id
  - DELETE /api/products/:id
- Sales
  - POST /api/sales/orders
  - GET /api/sales/orders/:id
  - POST /api/sales/invoices/:id/pay
- Purchase
  - POST /api/purchases/orders
- Inventory
  - GET /api/inventory/stock?productId=&warehouseId=
  - POST /api/inventory/adjustments

6. Webhooks & Events
- Emit domain events for important changes (order created, stock low, invoice paid)
- Provide webhook endpoints for external integrations

7. Pagination, Filtering, Sorting
- Use standard query params: page, limit, sortBy, order, q, filters

8. Versioning
- Use /api/v1/... when breaking changes are introduced

(เอกสารนี้ควรขยายเป็น contract เชิงละเอียดสำหรับแต่ละ resource และตัวอย่าง request/response ในแต่ละ endpoint)