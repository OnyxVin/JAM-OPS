# JAM OPS — Changelog

All changes from initial prototype launch to present, in chronological order.

---

## v1.0.0 — 22 May 2026
### Initial Prototype Launch

First working version deployed to Vercel. Built entirely from scratch.

**AR Tracker (`/receivables`)**
- View all customer invoices in a table with Invoice Code, Customer, Invoice Date, Due Date, Total, Paid, Remaining, and Status columns
- Status badges: Unpaid (red), Partial (yellow), Paid (green), Overdue (red + bold)
- Summary bar showing Total Outstanding (Rp), Overdue invoice count, and Due-in-7-Days count
- Click any row to expand inline payment history
- Add Invoice modal (Invoice Code, Customer Name, Invoice Date, Due Date, Total Amount, Notes)
- Add Payment modal per invoice (Payment Date, Amount Paid, Notes)
- Edit Invoice — modify any field on an existing invoice
- Delete Invoice — removes invoice and all its payments, with confirmation prompt
- Search bar — filters across Invoice Code, Customer Name, and Notes
- Month filter — filter by Invoice Date month
- Status filter — filter by Unpaid / Partial / Paid
- Auto-refresh every 30 seconds
- Manual Sync button with last-synced timestamp
- Auto-generated invoice code suggestion (e.g. INV-001, INV-002)

**Canvas Tracker (`/canvas`)**
- Open Runs section — active canvas runs listed as cards
- Closed Runs section — collapsible, shows completed runs
- Click any run to expand item table
- Open run items: Item Name, Qty Brought
- Closed run items: Item Name, Qty Brought, Qty Returned, Qty Sold (auto-computed as Brought − Returned)
- New Canvas Run modal — Sales Rep dropdown (Tonny, Rudi), Date Out, dynamic item rows with Add Item button
- Close Canvas Run modal — per-item Qty Returned inputs, Date Closed field
- Edit Run — modify sales rep, date out, and items
- Delete Run — removes run and all its items, with confirmation prompt
- Auto-generated Canvas ID (e.g. CNV-001)

**App Shell**
- Home page (`/`) with module selection cards
- Top navigation bar with brand, page links, and EN/ID language toggle
- 404 page for unmatched routes
- EN/ID bilingual interface — 75+ translation keys covering all UI text; language choice persisted in localStorage
- Google Sheets backend — 4 sheets: AR_Invoices, AR_Payments, Canvas_Runs, Canvas_Items
- OAuth2 authentication via credentials loaded from `token.json` on disk

---

## v1.1.0 — 22 May 2026
### Password Protection + OAuth Credentials to Env Vars

**New features**
- Login page (`/login`) — password field, error state, loading state, submit on Enter
- Session cookie — httpOnly cookie issued on successful login, clears on logout
- Logout button in the navigation bar
- Next.js middleware (`middleware.ts`) — every route redirects to `/login` unless the session cookie is valid; only `/login` and `/api/auth` are public

**Bug fix — OAuth credentials on Vercel**
- **Problem:** `token.json` was read from the local filesystem. Vercel has an ephemeral filesystem that does not persist files between deployments or serverless function invocations, causing OAuth to fail in production.
- **Fix:** Migrated all Google OAuth credentials (`access_token`, `refresh_token`, `client_id`, `client_secret`) to environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`). No file reads at runtime.

**Improvement — Independent date filters**
- **Before:** Invoice Date and Due Date month filters shared a single dropdown, so filtering by one affected the other.
- **After:** Invoice Date and Due Date each have their own independent month filter dropdown.

---

## v1.2.0 — 24 May 2026
### Header-Driven Column Reading + Address & Discount Fields

**New fields on invoices**
- **Address** — optional delivery/customer address stored per invoice
- **Discount (%)** — percentage discount applied to the gross total
- **Net Total** is now the primary amount shown in the table (Gross Total × (1 − Discount / 100))
- Expanded invoice row shows: Gross Total, Discount %, Net Total as a breakdown
- Payment completion threshold uses Net Total, not Gross Total — a 10% discount correctly reduces the "paid in full" target

**Bug fix — Column order fragility**
- **Problem:** `lib/sheets.ts` read invoice data by fixed column index (column 0 = Invoice Code, column 1 = Customer Name, etc.). If anyone reordered columns in Google Sheets — even just to add a new column — all data would break silently with no error message.
- **Fix:** Rewrote all invoice sheet functions to build a `colMap` from the header row on every read. Each field is looked up by its header name, not its position. Column order in Google Sheets is now irrelevant.

---

## v1.2.1 — 24 May 2026
### Fix: Column Headers Are Now Case-Insensitive

**Bug fix**
- **Problem:** The `colMap` header lookup was case-sensitive. A Google Sheet with headers written as `"Invoice Code"`, `"INVOICE CODE"`, or `"invoice code"` would produce different results. Any capitalisation mismatch caused that column's data to return empty with no warning.
- **Fix:** All header names are normalized to lowercase and trimmed (extra whitespace collapsed) on both the sheet side and the lookup side before any comparison. The app now matches headers regardless of capitalisation or spacing.

---

## v1.2.2 — 24 May 2026
### Fix: Total Amount Showing Rp 0

**Bug fix**
- **Problem:** Every invoice showed Total Amount as Rp 0 despite values existing in the sheet. Root cause: Google Sheets with an Indonesian locale returns numbers as locale-formatted strings — e.g. `"15.623.000"` (dots as thousand separators, not decimal points). Calling `parseFloat("15.623.000")` returns `15.623`, not `15,623,000`. All downstream calculations produced near-zero results.
- **Fix:** Added `valueRenderOption: 'UNFORMATTED_VALUE'` to the Sheets API request. This returns the raw cell value — actual numbers as numbers, not locale-formatted strings. All cells are then normalized to plain strings uniformly before processing.

---

## v1.2.3 — 24 May 2026
### Fix: Dates Appearing as Numbers (Serial Number Conversion)

**Bug fix**
- **Problem:** Dates that were copy-pasted into Google Sheets from an external spreadsheet were stored internally as Google Sheets date serial numbers (e.g. `46118`). After the UNFORMATTED_VALUE change in v1.2.2, these came through as raw integers instead of `DD/MM/YYYY` strings, displaying literally as `46118` in the app.
- **Root cause:** Google Sheets stores date-type cells as the number of days since 30 December 1899. UNFORMATTED_VALUE returns this raw integer. Text-type date cells (entered manually in the web app) come through as strings and are unaffected.
- **Fix:** Added a `normalizeDate()` helper in `lib/sheets.ts`. On every date field read, if the value is a number greater than 1000, it converts it: `new Date(Date.UTC(1899, 11, 30) + serial × 86400000)` → formatted as `DD/MM/YYYY`. Dates already in string format pass through unchanged. Applied to Invoice Date, Due Date, Date Out, and Date Closed.

---

## v1.3.0 — 24 May 2026
### Column Sorting + Filter-Adaptive Summary Bar

**New feature — Column sorting (AR Tracker)**
- Click any sortable column header to cycle through three states: ascending → descending → off
- Sortable columns: Invoice Code, Customer, Invoice Date, Due Date, Net Total, Remaining
- Active sort direction shown with a blue ↑ or ↓ arrow; inactive columns show a gray ⇅ indicator
- Date columns sort by actual chronological value, not alphabetically
- Sort is applied after all active filters — the sorted order always reflects the currently visible rows

**New feature — Filter-adaptive summary bar**
- **Before:** Total Outstanding, Overdue count, and Due in 7 Days always reflected all invoices regardless of any active filters.
- **After:** All three summary figures recalculate dynamically from only the invoices currently visible after filtering. For example, filtering to May invoices shows only May's outstanding balance and overdue count.
- When a filter is active, a small indicator appears beneath Total Outstanding showing `X / Y invoices` (filtered count vs. total count).
