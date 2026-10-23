# IPADEL Digital Menu

A branded digital drinks menu for IPADEL club visitors, with a private Memory Basket reminder saved only on the customer's device.

## Run & Operate

- `artifacts/ipadel-menu: web` — run the menu preview workflow
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- IPADEL menu UI: HTML, CSS, vanilla JavaScript modules, Vite
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ipadel-menu/index.html` — menu page structure and metadata
- `artifacts/ipadel-menu/public/menu.css` — menu styling and responsive layout
- `artifacts/ipadel-menu/js/data.js` — replaceable sample drinks, variants, and prices
- `artifacts/ipadel-menu/js/app.js` — filters, details panel, and device-local Memory Basket
- `artifacts/ipadel-menu/public/assets/` — original IPADEL logo and menu photography

## Architecture decisions

- The menu is a frontend-only experience; it does not call the API server or database.
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

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
