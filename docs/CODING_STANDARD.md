CODING_STANDARD

Coding Standard & Conventions (Technical)

1. Technology Stack & Tooling
- Frontend: Next.js (app router), React, TypeScript
- Styling: TailwindCSS
- State & Data: React Hook Form, Zod, Server Actions
- Backend: Next.js Server Components / Server Actions (Route Handlers for auth)
- DB: Neon Postgres + Drizzle ORM
- Tooling: ESLint, Prettier, TypeScript, Husky, lint-staged, Vitest/Jest

2. Project Structure
- apps/
- web/
- docs/
- drizzle/ (SQL migrations + metadata)
- src/
  - app/ (Next.js routes and layouts)
  - components/
  - features/ (domain feature folders)
  - hooks/
  - repositories/ (Drizzle DB access)
  - db/ (schema, connection, query helpers)
  - lib/ (auth guard, shared utilities)
  - types/
  - schemas/ (zod schemas)
  - utils/
  - constants/
  - stores/
- public/

3. TypeScript & Linting
- tsconfig.json: strict mode enabled ("strict": true)
- ESLint: extend recommended configs (eslint:recommended, plugin:@typescript-eslint/recommended)
- Prettier: unified formatting rules; run on save via editor integration
- Husky + lint-staged: run lint and tests on pre-commit

4. Coding Practices
- Small, focused functions and components
- Single responsibility for modules
- Prefer composition over inheritance
- Use zod for runtime validation of API inputs and important boundary checks
- Avoid inline styles; use Tailwind utility classes or tokens

5. Testing
- Unit tests for utilities and service logic
- Integration tests for API endpoints and DB interactions (use a test database)
- E2E tests for critical flows (optional, e.g., Playwright)
- Coverage: enforce minimum coverage for critical modules (e.g., 70%+)

6. Git & PR Workflow
- Branching: feature/<short-description>, fix/<issue-id>, hotfix/
- PR requirements: description, linked issue, testing steps, screenshots for UI
- Review: at least one approver; run CI checks before merge
- Commit messages: Conventional Commits (feat/, fix/, chore/, docs/)

7. Code Review Checklist
- Is type-safety maintained?
- Are edge cases and error states handled?
- Are tests included where applicable?
- Is code modular and readable?
- Have secrets been excluded from changes?

8. CI Recommendations
- Steps: install dependencies → lint → typecheck → run unit tests → build
- Run integration tests against a disposable Neon branch or Dockerized Postgres

9. Documentation
- Document public APIs and major services
- Keep docs/ updated with architecture decisions and runbooks

(สามารถเพิ่มตัวอย่าง config files เช่น .eslintrc, tsconfig.json, prettierrc ถ้าต้องการ)
- Frontend: Next.js (app router), React, TypeScript, TailwindCSS
- State/Query: React Hook Form, Zod, Server Actions
- Backend: Next.js Server Components/Actions, repositories pattern
- DB: Neon Postgres + Drizzle ORM

2. Project Structure (จาก IDEA)
- apps/ web/
- docs/
- drizzle/ migrations
- src/
  - app/
  - components/
  - features/
  - hooks/
  - services/
  - repositories/
  - lib/
  - types/
  - schemas/
  - utils/
  - constants/
  - stores/
- public/

3. Conventions
- Use TypeScript with strict mode where possible
- Prefer small, focused functions and components
- Use zod schemas for runtime validation of inputs
- Naming: camelCase for variables, PascalCase for React components and types, kebab-case for file names when appropriate
- Avoid large files; keep modules under reasonable size

4. Tests & CI
- Write unit tests for services and critical logic
- Add integration tests for key flows if possible
- CI pipeline should run lint, typecheck, tests, and build

5. Code Review
- PRs should be small and focused
- Include description, testing steps, and screenshots if UI changes
- Follow consistent commit message style

(ขยายกฎเพิ่มเติมตามทีมและการใช้งานจริง)