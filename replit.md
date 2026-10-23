# IPADEL Digital Menu

A branded digital drinks menu for IPADEL club visitors, with a private Memory Basket reminder saved only on the customer's device.

## Run & Operate

- `artifacts/ipadel-menu/` — static website; open `index.html` directly or serve this folder with any static web server
- `pnpm --filter @workspace/api-server run dev` — run the separate API server (port 5000)
- `pnpm run typecheck` — full typecheck across remaining workspace packages
- `pnpm run build` — typecheck + build workspace packages that have build scripts
- Required env for API only: `DATABASE_URL` — Postgres connection string

## Stack

- IPADEL menu UI: static HTML, CSS, and classic browser JavaScript; no React or frontend build step is required
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from the OpenAPI spec)
- Workspace tools: pnpm, TypeScript

## Where things live

- `artifacts/ipadel-menu/index.html` — landing page
- `artifacts/ipadel-menu/drinks.html` — drinks catalog
- `artifacts/ipadel-menu/canteen.html` — Canteen coming-soon page
- `artifacts/ipadel-menu/menu.css` and `menu-overrides.css` — styles and responsive layouts
- `artifacts/ipadel-menu/js/data.js` — replaceable sample drinks, variants, and prices
- `artifacts/ipadel-menu/js/app.js` — catalog, details panel, reveals, and device-local Memory Basket
- `artifacts/ipadel-menu/assets/` — IPADEL logo and menu photography

## Architecture decisions

- The menu is frontend-only and does not call the API server or database.
- The menu uses no framework, package runtime, or build step; scripts and assets load by relative paths.
- Memory Basket stores only item IDs, variants, and quantities in browser localStorage; it is never submitted or visible to staff.
- Sample products and prices are intentionally separate from rendering so the real menu can replace them without redesigning the interface.

## Product

- Browse, search, and filter a small sample drinks menu; inspect item details and save personal reminders.
- The Canteen is marked as coming soon and contains no food products.
- Sample prices are illustrative only and must be replaced with confirmed menu data.

## User preferences

- Keep the first menu iteration drinks-only.
- Memory Basket is a personal reminder saved on the customer's device; never send an order to the cashier.
- Keep real menu content replaceable independently of the interface.
