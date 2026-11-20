UI_UX_GUIDE

Design System (Technical Guidelines)

1. Design Principles
- Mobile First: ออกแบบ UI โดยเริ่มจาก mobile breakpoints แล้วรองรับ tablet/desktop
- Consistency: ใช้ component library เดียว (Shadcn UI + Tailwind) และ design tokens
- Accessibility: aria-labels, keyboard navigation, color contrast >= 4.5:1
- Performance: ลด re-render, lazy-load heavy components

2. Breakpoints & Layout
- Breakpoints (tailwind style):
  - sm (>= 640px)
  - md (>= 768px)
  - lg (>= 1024px)
  - xl (>= 1280px)
- Grid: responsive layout with 12-column grid on desktop; single-column stacks on mobile

3. Navigation & Information Architecture
- Global header with search and user menu
- Sidebar: collapsible, shows modules based on permissions
- Breadcrumbs for deep pages

4. Common Page Patterns
- List pages:
  - Top: title + actions (Create, Import, Export)
  - Filter bar: search, filter chips, date range
  - Table: sortable columns, row actions, bulk actions, pagination
  - Export & Import: CSV/Excel, with template download
- Detail pages:
  - Summary card + tabs for related data (Lines, History, Files)
  - Inline edit where sensible

5. Forms & Validation
- Use React Hook Form + Zod for schema validation
- Show inline errors with clear messages
- Disable submit while submitting; use optimistic UI for non-critical updates

6. Components (spec)
- Button: primary/secondary/ghost sizes
- Input: with clear button, support async suggestions (typeahead)
- Select: searchable, multi-select
- Table: virtualized for large data sets, supports column resizing
- Modal & Drawer: use for creation workflows; keep accessible (trap focus)
- Notifications: toast for transient messages; alert area for persistent warnings

7. Dashboard & Widgets
- Widgets must be small, load data async, support time-range
- KPI card: value, delta vs period, sparkline

8. POS UI specifics
- Big tappable elements, product favorites, fast product search by sku/name/barcode
- Payment modal: supports multi-payment and shows change due

9. Theming & Tokens
- Tokens for colors, spacing, typography
- Support Light/Dark via CSS variables

10. Accessibility Checklist
- All interactive elements keyboard reachable
- Images have alt text
- Color contrast meets WCAG AA
- Forms have labels and error associations

11. Documentation & Storybook
- Maintain Storybook for components
- Document component props, behavior, accessibility notes, and example usage

(เก็บ pattern library และตัวอย่าง UI snapshots ใน /docs/assets หรือ Storybook repository)
- Mobile First / Responsive (Desktop, Tablet, Mobile)
- Consistent components (Shadcn UI + Tailwind)
- Accessible (a11y) and keyboard friendly
- Fast and lightweight interactions

2. Common UI Elements
- Global search, filters, sort, pagination on list pages
- Export / Import actions on list/report pages
- Reusable form components (with React Hook Form + Zod validation)

3. Dashboard
- Widgets: Today's Sales, Monthly Sales, Profit, Expense, Stock Alert, Pending Orders, Low Stock, Best Seller, Recent Activities
- KPI cards and time-range filters

4. POS UI
- Touch-friendly grid, large buttons, clear payment flow
- Offline-friendly UI behaviors where applicable

5. Theming
- Support Light / Dark themes
- Provide tokenized color system and spacing scale

6. Component Patterns
- Small presentational components + container/feature components
- Follow accessibility roles and semantic HTML

(รวม component library, design tokens, และตัวอย่าง layout ใน folder /docs/assets หรือ storybook เมื่อพร้อม)