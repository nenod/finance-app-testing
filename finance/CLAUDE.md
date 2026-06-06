# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Heed `AGENTS.md`:** this project pins **Next.js 16.2.7** and **React 19.2**, which differ from older conventions. Read the relevant guide under `node_modules/next/dist/docs/` (e.g. `01-app/`) before writing Next-specific code.

## Project

FinTrack — a single-page personal finance & stock portfolio dashboard. One route (`/`) renders summary cards (fiat balance, portfolio value, net worth), a transactions table, a portfolio table, and a current-month expenses pie chart. Mutations happen through dialogs that POST/DELETE to API routes and then call `router.refresh()`.

## Commands

```bash
npm run dev        # start dev server at http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint (flat config, eslint-config-next)

npm run db:push    # apply prisma/schema.prisma to dev.db (no migrations dir)
npm run db:seed    # wipe + reseed dev.db with sample data (tsx prisma/seed.ts)
```

There is no test runner configured.

## Architecture

**Data flow.** The page is a React Server Component with `export const dynamic = "force-dynamic"` — it fetches fresh DB + stock prices on every request. Server data loaders live in `src/lib/data.ts` (`getTransactions`, `getPortfolio`, plus pure helpers `computeFiatBalance` and `expensesByCategoryThisMonth`). Client dialog components mutate via `fetch` to `/api/*` routes, then `router.refresh()` to re-render the server component. The API routes (`src/app/api/transactions`, `src/app/api/portfolio`) reuse the same `src/lib/data.ts` loaders for their GET handlers, so server-render and client-fetch share one code path.

**Database (Prisma 7 + SQLite).**
- Prisma 7 requires a **driver adapter**. Both `src/lib/prisma.ts` and `prisma/seed.ts` construct `PrismaBetterSqlite3({ url: DATABASE_URL })` and pass it as `{ adapter }` to `new PrismaClient(...)`. There is no `datasource.url` in the schema — it comes from `DATABASE_URL` (`.env`, `file:./dev.db`) via the adapter and `prisma.config.ts`.
- The generated client is **committed-out / gitignored at `src/generated/prisma`** (custom `output` in the schema), imported as `@/generated/prisma/client` — *not* `@prisma/client`. Regenerate it by running `npm run db:push` after schema changes.
- Two models, `Transaction` and `StockHolding` (see `prisma/schema.prisma`). `Transaction.type` is a plain string `"INCOME"`/`"EXPENSE"`; `StockHolding.ticker` is unique and POSTs upsert on it.
- `prisma.config.ts` (not `package.json`) defines schema/migrations/datasource for the CLI and needs `import "dotenv/config"` to load `.env`.

**Stock prices.** `src/lib/yahoo.ts` exports a single instantiated `yahoo-finance2` v3 client. `getPortfolio` quotes each holding, preferring `regularMarketPreviousClose` (latest daily close) over the live price, and swallows per-ticker failures (price → 0) so one bad ticker doesn't break the page.

**UI.** shadcn (`base-nova` style, see `components.json`) on top of `@base-ui/react` (note: **not** Radix). Generated primitives live in `src/components/ui/`; feature components (dialogs, tables, chart) in `src/components/`. Tailwind v4 (config-less, via `@tailwindcss/postcss`; theme in `src/app/globals.css`). Charts use `recharts`. Path alias `@/*` → `src/*`. Note the `base-ui` `DialogTrigger` uses a `render={<Button/>}` prop rather than `asChild`.

## Conventions

- Server data is serialized to DTOs (`TransactionDTO`, `PortfolioPosition`) with dates as ISO strings before crossing to the client.
- Currency/date formatting goes through `src/lib/format.ts` (`formatCurrency`, `formatDate`).
- API POST handlers validate input manually and return `{ error }` with a 4xx/5xx status; client dialogs read `data.error` to display failures.
