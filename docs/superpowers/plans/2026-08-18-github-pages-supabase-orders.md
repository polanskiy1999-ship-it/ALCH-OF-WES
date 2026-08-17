# GitHub Pages + Supabase Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Alchemy of Wishes through GitHub Pages for reliable Russian access while storing orders in Supabase and forwarding each valid order to Telegram.

**Architecture:** Keep the existing Sites deployment as a rollback target. Add a second, browser-only Vite build that reuses the current React page, catalog, styles, and public assets and deploys from GitHub Actions. The public form calls a Supabase Edge Function; the function validates product IDs against a seeded `products` table, stores the order transactionally, and sends a Telegram notification with server-side secrets.

**Tech Stack:** React 19, Vite 8, GitHub Pages/Actions, Supabase Postgres + Edge Functions, Telegram Bot API, Node built-in test runner.

## Global Constraints

- Customers must not register or sign in.
- `TELEGRAM_BOT_TOKEN`, chat IDs, and Supabase service-role credentials must never enter the browser bundle or Git history.
- The existing Sites deployment stays available until `https://alchemyofwishes.ru` passes production checks.
- Existing catalog appearance, navigation, cart behavior, and responsive layout must remain unchanged.
- The canonical production domain is `https://alchemyofwishes.ru`.

---

### Task 1: Isolate Order Payload Logic

**Files:**
- Create: `app/order-payload.ts`
- Create: `tests/order-payload.test.mjs`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `OrderRequest`, `buildOrderRequest(formData, cartItems)`, and `buildTelegramDraft(...)`.
- Consumers: the cart form in `app/page.tsx` and the static Pages build.

- [ ] **Step 1: Write the failing test**

  Test that form values are trimmed, quantities are preserved, the honeypot is included, and Telegram fallback text lists every chosen product.

- [ ] **Step 2: Run test to verify it fails**

  Run: `node --test tests/order-payload.test.mjs`
  Expected: FAIL because `app/order-payload.ts` does not exist.

- [ ] **Step 3: Implement the shared payload helpers**

  Export a serializable payload shaped as `{ name, telegram, comment, company, items: [{ id, quantity }] }`; keep text limits aligned with the server validator.

- [ ] **Step 4: Route the form through the shared helper**

  Replace the inline payload construction and duplicate Telegram draft builder in `app/page.tsx` without changing the UI.

- [ ] **Step 5: Run the unit test**

  Run: `node --test tests/order-payload.test.mjs`
  Expected: PASS.

### Task 2: Add the GitHub Pages Build

**Files:**
- Create: `pages/index.html`
- Create: `pages/main.tsx`
- Create: `vite.pages.config.ts`
- Create: `public/CNAME`
- Create: `.github/workflows/pages.yml`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: default export `Home` from `app/page.tsx`, `app/globals.css`, and everything under `public/`.
- Produces: `dist-pages/index.html` and asset files suitable for GitHub Pages.

- [ ] **Step 1: Add a failing Pages artifact check**

  Add a package script that builds `vite.pages.config.ts`, then checks that `dist-pages/index.html`, `dist-pages/CNAME`, `dist-pages/og-alchemy-wordmark.png`, and a catalog image exist.

- [ ] **Step 2: Run it to verify it fails**

  Run: `npm run build:pages`
  Expected: FAIL because the Pages entry and configuration do not exist.

- [ ] **Step 3: Implement the browser-only entry**

  Render `<Home />` into `#root`, import the existing stylesheet, carry the production metadata into static HTML, use `/` as the production base, and copy the existing public directory unchanged.

- [ ] **Step 4: Add GitHub Pages deployment**

  Configure Actions with `pages: write`, `id-token: write`, `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. Build with the public Supabase URL and publishable key supplied as repository variables/secrets.

- [ ] **Step 5: Verify the build**

  Run: `npm run build:pages`
  Expected: PASS and all required static artifacts present.

### Task 3: Create the Supabase Order Backend

**Files:**
- Create: `supabase/migrations/202608180001_orders.sql`
- Create: `supabase/functions/order/index.ts`
- Create: `supabase/functions/order/catalog.ts`
- Create: `supabase/config.toml`
- Create: `.env.example`

**Interfaces:**
- Endpoint: `POST <SUPABASE_URL>/functions/v1/order`.
- Request: `OrderRequest` from Task 1.
- Success: `{ "ok": true, "orderId": "<uuid>" }`.
- Failure: `{ "ok": false, "code": "invalid_order" | "empty_order" | "delivery_failed" }` with an appropriate HTTP status.

- [ ] **Step 1: Write Edge Function tests before implementation**

  Cover malformed JSON, the honeypot, empty/unknown products, quantity bounds, allowed origins, database failure, Telegram failure, and a successful order.

- [ ] **Step 2: Run tests to verify they fail**

  Run: `deno test supabase/functions/order/index.test.ts --allow-env`
  Expected: FAIL because the handler does not exist.

- [ ] **Step 3: Create the database migration**

  Create `products`, `orders`, and `order_items`; deny anonymous table writes through RLS; expose writes only through the Edge Function service client; seed every current catalog ID and title idempotently.

- [ ] **Step 4: Implement the Edge Function**

  Validate the origin, payload, text lengths, IDs, and quantities; store the order and items; format the existing Russian Telegram message; use `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ORDER_CHAT_ID` from function secrets; return CORS headers only for approved origins.

- [ ] **Step 5: Run the Edge Function tests**

  Run: `deno test supabase/functions/order/index.test.ts --allow-env`
  Expected: PASS.

### Task 4: Connect the Frontend to Supabase

**Files:**
- Create: `app/order-transport.ts`
- Create: `tests/order-transport.test.mjs`
- Modify: `app/page.tsx`
- Modify: `.env.example`

**Interfaces:**
- Produces: `submitOrder(payload, config): Promise<{ ok: true; orderId?: string }>`.
- Configuration: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the Pages build; `/api/order` remains the fallback for the existing Sites deployment.

- [ ] **Step 1: Write the failing transport tests**

  Verify that configured static builds call the Edge Function with JSON and the publishable authorization header, while unconfigured Sites builds call `/api/order`.

- [ ] **Step 2: Run tests to verify they fail**

  Run: `node --test tests/order-transport.test.mjs`
  Expected: FAIL because `app/order-transport.ts` does not exist.

- [ ] **Step 3: Implement the transport**

  Keep the request timeout bounded, distinguish validation/delivery/network errors, and preserve the current Telegram-link fallback when both transports are unavailable.

- [ ] **Step 4: Integrate without visual changes**

  Replace `fetch("/api/order")` in `app/page.tsx` with `submitOrder(...)`; preserve all existing success, loading, and failure text.

- [ ] **Step 5: Run unit, lint, and both production builds**

  Run: `node --test tests/*.test.mjs`, `npm run lint`, `npm run build`, `npm run build:pages`.
  Expected: all pass.

### Task 5: Publish and Switch the Domain

**Files:**
- Modify through GitHub UI/API: repository Pages settings, Actions variables/secrets.
- Modify through Supabase UI: new project, migration, Edge Function, function secrets.
- Modify through REG.RU UI: apex A records and `www` CNAME.

**Interfaces:**
- Public site: `https://alchemyofwishes.ru`.
- Rollback site: the existing Sites deployment URL.

- [ ] **Step 1: Commit and push the validated implementation**

  Push a dedicated `codex/github-pages-supabase` branch, then merge/push only after build checks pass.

- [ ] **Step 2: Provision Supabase**

  Create/select the Alchemy project, apply the migration, deploy the `order` function with public invocation, add Telegram secrets, and record only the public URL/key in GitHub.

- [ ] **Step 3: Publish GitHub Pages**

  Enable Actions-based Pages deployment, set `alchemyofwishes.ru`, wait for the workflow to succeed, and verify the `github.io` preview before touching DNS.

- [ ] **Step 4: Switch DNS without deleting the rollback**

  Change apex A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`; point `www` to `polanskiy1999-ship-it.github.io`; leave unrelated TXT records intact.

- [ ] **Step 5: Verify production**

  Confirm HTTPS, desktop/mobile rendering, static assets, catalog filters, cart, successful order persistence, Telegram notification, and `www` redirect. Confirm the old Sites URL still works as rollback.

## Self-Review

- Spec coverage: GitHub Pages availability, Supabase persistence, Telegram delivery, no customer registration, secret isolation, DNS cutover, and rollback are each covered.
- Placeholder scan: no implementation placeholders or deferred requirements remain.
- Type consistency: Tasks 1 and 4 use the same `OrderRequest`; Task 3 accepts exactly that payload; production URLs and domain names are consistent.
