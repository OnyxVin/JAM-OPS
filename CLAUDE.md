# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev        # start dev server on localhost:3000
npm run build      # production build (runs type-check + Next.js build)
npm run lint       # ESLint via next lint
npx tsc --noEmit   # type-check only, no output files
```

No test suite exists. Verify features by running the dev server and interacting with the app.

---

## Architecture

**JAM OPS** is a Next.js 14 App Router app for a B2B car spare parts business. Two modules:

- **AR Tracker** (`/receivables`) — tracks customer invoices (create/edit/delete), payments, and overdue status
- **Canvas Tracker** (`/canvas`) — tracks sales rep field runs: items brought out, items sold, run open/close lifecycle

### Data layer — Google Sheets as the database

All reads and writes go through `lib/sheets.ts`. The app uses **four separate Google Sheets spreadsheets**, each with its own `SHEET_ID` and `TAB_NAME` env var:

| Module | Sheet | Env vars |
|---|---|---|
| AR | AR_Invoices | `GOOGLE_SHEET_ID_AR_INVOICES`, `GOOGLE_TAB_AR_INVOICES` |
| AR | AR_Payments | `GOOGLE_SHEET_ID_AR_PAYMENTS`, `GOOGLE_TAB_AR_PAYMENTS` |
| Canvas | Canvas_Runs | `GOOGLE_SHEET_ID_CANVAS_RUNS`, `GOOGLE_TAB_CANVAS_RUNS` |
| Canvas | Canvas_Items | `GOOGLE_SHEET_ID_CANVAS_ITEMS`, `GOOGLE_TAB_CANVAS_ITEMS` |

**Canvas_Items sheet headers (exact, case-insensitive):**
`Canvas_ID | Item Code | Part Number | Item Name | Brand | Quantity Brought | Quantity Sold | Date Closed | Status`

**AR_Invoices sheet headers (exact, case-insensitive):**
`Invoice Code | Customer Name | Invoice Date | Due Date | Total Amount | Discount | Address | Status`

#### Critical `lib/sheets.ts` patterns

- `getSheetValues()` always uses `valueRenderOption: 'UNFORMATTED_VALUE'` — returns raw numbers, not locale-formatted strings like `"15.623.000"`.
- `buildColumnMap(headers)` normalizes headers to lowercase + trimmed, so column order in the sheet doesn't matter. Always look up columns by name, never by index.
- `normalizeDate(value)` converts Google Sheets serial numbers (integers like `46118`) to `DD/MM/YYYY`. Applied on every date field read.
- All dates are stored and passed as `DD/MM/YYYY` strings throughout the app. HTML `<input type="date">` uses `YYYY-MM-DD`, converted by `toInputDate()` / `fromInputDate()` helpers in each page.
- Row writes: read the full row first, build a new array sized to `max(colMap values) + 1`, fill from `colMap` lookups, then call `updateRow()`. This preserves columns the app doesn't manage.

### Auth

`middleware.ts` protects every route except `/login` and `/api/auth`. Session is an httpOnly cookie set by `POST /api/auth`. Password is `process.env.NEXT_PUBLIC_APP_PASSWORD`.

Google OAuth uses only env vars — no `token.json` file at runtime:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

### i18n

All UI text goes through `lib/i18n.ts` + `lib/LanguageContext.tsx`. Language is toggled in the nav and stored in `localStorage`. Translation keys are namespaced: `nav.*`, `common.*`, `ar.*`, `canvas.*`, `status.*`. The `t(key)` hook is available everywhere via `useLanguage()`.

### ID / code generation

- Invoice codes: `FP{YY}{MM}{NNNN}` — e.g. `FP260500001`
- Canvas IDs: `CVS{YY}{MM}{NNNN}` — e.g. `CVS260500001`
- Auto-generated on the server via `/api/receivables/next-code` and `/api/canvas/next-id`, but users can override them manually.

### API routes

All backend logic lives in `app/api/`. Route handlers use Node.js runtime (never `export const runtime = 'edge'`). Pattern:

- `GET /api/receivables` — joins AR_Invoices + AR_Payments, computes status, returns `{ invoices, summary }`
- `POST /api/receivables` — create invoice
- `PATCH /api/receivables/[id]` — edit invoice fields
- `POST /api/receivables/[id]` — add payment, recomputes and writes status back to sheet
- `DELETE /api/receivables/[id]` — delete invoice + all its payments

Canvas follows the same pattern: `GET /api/canvas`, `POST`, `PUT` (edit run), `PATCH` (close run + write sold qtys), `DELETE`.

### Page architecture

Both `/receivables/page.tsx` and `/canvas/page.tsx` are `'use client'` components. They fetch from their API route, hold all state locally, and refresh every 30 seconds via `setInterval`. Filtering and sorting are pure client-side `useMemo` over the fetched array — no re-fetching on filter change.

---

## Quality gates

Before declaring any feature done, verify:

- Success, loading, empty, and error states all render correctly
- All CRUD operations exist: create, read, update, delete
- Buttons and forms are disabled during async operations (no duplicate submissions)
- Every list shows a human-readable empty-state message
- Changes made directly in Google Sheets are retrievable via the Sync button
- New env vars are documented in `.env.example`

---

## Key constraints

- **No test suite** — verification is manual via the running app
- **No `console.log`** in committed code
- **Column order in Google Sheets is irrelevant** — always use `buildColumnMap`, never positional index
- **Do not use `FORMATTED_VALUE`** (the default) — Indonesian locale formats numbers as `"15.623.000"` which breaks `parseFloat`
- **`app/api/debug-sheet/route.ts`** is a temporary diagnostic endpoint — remove it before any production audit
- Do not refactor or restructure existing code without being asked
