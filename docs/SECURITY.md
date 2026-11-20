SECURITY

Authentication, Authorization & Security (Technical)

1. Authentication
- Use Better Auth with email/password; sessions stored in Neon (`session` table)
- Session cookie is httpOnly and read by `src/lib/auth.ts` on every request
- `src/proxy.ts` performs an optimistic cookie check; pages/actions verify the
  real session before reading or writing data

2. Authorization (RBAC)
- Role -> Permission -> Menu -> Action model
- Permissions stored in DB and cached in memory (TTL) for performance
- Enforce authorization both at API (service) layer and UI layer

3. Tenant isolation
- The app connects to Neon with a single server-side database role; clients
  never query the database directly
- Every repository query includes `company_id` from the verified profile
- Server actions derive `company_id`/`user_id` from the session, never from the
  request body
- Postgres business functions call `assert_company_member` before mutating data

4. Input Validation & Sanitization
- Use Zod schemas to validate body/query params
- Prevent SQL injection by using parameterized queries/ORM

5. Transport & Data Protection
- Enforce HTTPS/TLS for all traffic
- Use httpOnly, sameSite cookies for sessions; never expose secrets to the client
- Do not log sensitive data (passwords, full tokens)

6. File Uploads
- Validate MIME types and size limits
- Scan for viruses if storing untrusted files
- Store files in an object-storage provider with per-tenant prefixes and signed URLs

7. Audit Logging & Monitoring
- Audit logs: user_id, ip, action, target_table, target_id, old_value, new_value, created_at
- Centralize logs (SaaS like Sentry/Datadog) and set alerting for anomalous patterns

8. Secrets Management
- Store secrets in Vercel/Neon environment variables or a secrets manager
- Do not commit secrets to repo; use environment-specific variables

9. Network & Infrastructure
- Apply principle of least privilege to service accounts and DB users
- Restrict admin panels by IP/MFA
- Use rate-limiting and WAF for public endpoints

10. CI/CD Security
- Scan dependencies for vulnerabilities (Dependabot, npm audit)
- Sign builds or use reproducible build practices where applicable

11. Incident Response & Recovery
- Runbook: detection → triage → containment → remediation → postmortem
- Backup verification and restore test regularly

(เอกสารนี้สามารถขยายเป็น checklist สำหรับ deployment, dev environment และตัวอย่าง RLS policy สำหรับแต่ละ table เมื่อ schema เสร็จสมบูรณ์)
- ใช้ Better Auth (email/password) และเก็บ session ใน Neon
- ใช้ httpOnly session cookie; ตรวจ session ซ้ำใน server action ทุกครั้ง

2. Authorization
- RBAC: Role → Permission → Menu → Action
- Enforce permission checks at API layer and UI

3. Tenant isolation
- ไม่มี client-side DB access; repository ทุกตัวกรอง company_id จาก session
- ห้ามรับ company_id/user_id จาก request body ของ server action
- ฟังก์ชัน Postgres ตรวจ membership ด้วย `assert_company_member`

4. Data Protection
- ใช้ TLS for all network traffic
- Sensitive data encryption at rest follows the managed Postgres provider (Neon)
- Do not store secrets in repo; use environment variables and a secret manager

5. Audit & Monitoring
- Audit log ทุกการแก้ไขสำคัญ: user_id, timestamp, ip, action, old_value, new_value
- Logging and alerting for suspicious activities

6. File Storage
- ใช้ object storage ที่แยก prefix ตามบริษัท พร้อม signed URL
- Validate file types and sizes; scan where necessary

7. Best Practices
- Principle of least privilege for service accounts and API keys
- Rotate keys regularly
- Protect admin endpoints with additional MFA (where appropriate)
- Rate limiting for public endpoints

(รายละเอียด policy และ checklist security ควรขยายเป็นไฟล์ checklist แยกสำหรับ deployment และ development environment)