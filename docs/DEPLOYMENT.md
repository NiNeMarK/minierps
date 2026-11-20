# Deployment Guide (Vercel + Neon)

## 1. Overview

- **Frontend / server:** Next.js 16 on Vercel (Server Components + Server Actions)
- **Database:** Neon Postgres (pooled connection string)
- **Auth:** Better Auth, sessions stored in Neon
- **CI:** typecheck, lint, build, then apply migrations

## 2. Environment variables

| Variable | Scope | Notes |
| --- | --- | --- |
| `DATABASE_URL` | server | Neon pooled connection string (`sslmode=require`) |
| `BETTER_AUTH_SECRET` | server | random 32+ byte secret; rotate carefully |
| `BETTER_AUTH_URL` | server | public origin, e.g. `https://erp.example.com` |

Set them in Vercel Project Settings → Environment Variables for Production and
Preview. Never expose `DATABASE_URL` or `BETTER_AUTH_SECRET` with a
`NEXT_PUBLIC_` prefix.

## 3. First deploy

1. Create the Neon project and copy the pooled connection string.
2. Apply migrations against the target database:

   ```bash
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```

3. Import the repository into Vercel and add the env vars.
4. Build command: `npm run build`.
5. Deploy, then sign up once at `/auth` to verify the provisioning trigger.

Apply migrations **before** deploying code that depends on new columns or
functions. Prefer backward-compatible migrations.

## 4. CI pipeline

```yaml
- run: npm ci
- run: npm run typecheck
- run: npm run lint
- run: npm run build
```

Run migrations as a separate, explicit job against staging/production. Do not
let every preview deployment migrate the shared database.

## 5. Rollback & runbook

- Code: redeploy the previous Vercel deployment or revert the git tag.
- Database: use Neon point-in-time restore; write reversible migrations where
  possible.
- Pre-deploy checklist: migrations applied, env vars present, smoke test
  signup → product → sale → stock movement.
- Keep a contact list and maintenance window for production migrations.

## 6. Monitoring & alerts

- Error tracking: Sentry (or similar)
- Performance: Vercel analytics + Neon monitoring
- Alert on error rate, p95 latency, connection limits, and storage growth
- Check `stock_movements` integrity after any failed transaction

## 7. Scaling & cost

- Use the Neon pooled connection string for serverless functions
- Keep list endpoints paginated (current limits: 100 orders, 200 movements)
- Cache rarely changing reference data only when it is safe
- Monitor Neon compute hours and storage; scale to zero in non-production

## 8. Secrets

- Store secrets only in Vercel/Neon environment settings
- Rotate `BETTER_AUTH_SECRET` with a planned session invalidation
- Never commit `.env.local` (already git-ignored)
