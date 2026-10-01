# Morrow: objects for slow mornings

An editorial e-commerce storefront for hand-made ceramics. It's built to feel like a design-award site and runs like a real shop.

**Stack:** Next.js 16 (App Router, Server Actions) · React 19 · Tailwind CSS 4 · Motion · Lenis · Drizzle ORM · Postgres (Neon **or** Supabase) · Auth.js v5 with Google · Resend

## What's inside

**Experience**
- A WebGL hero: a domain-warped "molten glaze" shader that leans toward the cursor. It renders at reduced resolution and pauses when offscreen.
- Procedurally "photographed" products. Every object is an SVG studio still lit from its shape and glaze palette, so the catalogue needs no stock photography.
- Smooth scrolling (Lenis), masked line-by-line headline reveals, and a scroll-scrubbed manifesto.
- A pinned horizontal gallery, a cursor-following category preview, and magnetic buttons.
- A custom two-part cursor with contextual labels (View / Add / Place).
- A kiln-temperature preloader on first visit only, an ink-curtain page transition, and film grain.
- Respects `prefers-reduced-motion` and is fully responsive.

**Commerce**
- Catalogue with category filters and sorting, product pages with stock-aware add-to-bag, and related items.
- A cart persisted in Postgres. Guests get a cookie cart, which merges into their account cart when they sign in with Google.
- Checkout requires Google sign-in. It validates with Zod and runs in a single transaction with `SELECT … FOR UPDATE` row locks, so two shoppers can't buy the last piece. It snapshots line items, decrements stock, and clears the cart.
- The confirmation email is sent via the Resend API *after* the transaction commits. A mail outage never loses an order, and `confirmation_email_sent_at` records delivery.
- A welcome email is sent on first sign-in.
- Payment on delivery (cash or card at the door), stored on each order with a paid/unpaid status.
- Order confirmation page and an account page with order history. The checkout prefills the address from the shopper's last order.

## Setup

### 1. Install

```bash
pnpm install
cp .env.example .env.local
```

### 2. Database: Neon or Supabase

Create a project and copy the **pooled** connection string into `DATABASE_URL`:

- **Neon:** Dashboard → Connect → use the `-pooler` host.
- **Supabase:** Project Settings → Database → Connection string → *Transaction pooler* (port 6543).

Then create the tables and load the catalogue:

```bash
pnpm db:setup     # = db:migrate + db:seed
```

To browse the data, run `pnpm db:studio`. After schema changes, run `pnpm db:generate`.

### 3. Google sign-in (Google Cloud Console)

1. Go to <https://console.cloud.google.com/> and create (or pick) a project.
2. Open **APIs & Services → OAuth consent screen**. Choose *External*, add an app name and support email, and add the `openid`, `email` and `profile` scopes.
3. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**. Choose *Web application*.
   - Authorised JavaScript origins: `http://localhost:3000` (plus your production URL)
   - Authorised redirect URIs: `http://localhost:3000/api/auth/callback/google` (plus `https://YOUR_DOMAIN/api/auth/callback/google`)
4. Put the client ID and secret into `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`, and generate `AUTH_SECRET` with `npx auth secret`.

### 4. Resend

1. In <https://resend.com/domains>, add and verify your sending domain by adding the DNS records Resend shows you.
2. Create an API key at <https://resend.com/api-keys>. *Sending access* is enough. Set it as `RESEND_API_KEY`.
3. Set `EMAIL_FROM` to an address on that verified domain, e.g. `Morrow <orders@yourdomain.com>`.

> Without a verified domain you can send from `onboarding@resend.dev`, but Resend then only delivers to your own account's email address. That's fine for testing, not for real customers.

If Resend isn't configured, orders still go through; the server logs a warning and skips the email. Each order confirmation uses the order ID as an idempotency key, so it can't be sent twice.

### 5. Run

```bash
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

## Deploying (Vercel)

Import the repo and add the same environment variables, but set **`AUTH_URL` to your production URL** (e.g. `https://my-shop.vercel.app`), not `http://localhost:3000`. Auth.js uses it to tell Google where to send users back, so a copied localhost value makes Google sign-in bounce back to localhost. In Google Cloud Console, add `https://YOUR_DOMAIN/api/auth/callback/google` as an authorised redirect URI; it must match `AUTH_URL` exactly. Run `pnpm db:setup` once against the production database.

## Payments: pay on delivery

There is no online payment step, so nothing is mocked and no card data ever touches the site. At checkout the shopper chooses:

- **Cash on delivery**: pay the courier in cash.
- **Card on delivery**: pay on the courier's card terminal at the door.

The choice is stored on the order as `payment_method`, alongside `payment_status` (`unpaid` → `paid`) and `paid_at`. The checkout, confirmation page, account history and confirmation email all show the amount **due on delivery**.

When the courier collects payment, mark the order paid in `pnpm db:studio` or with SQL:

```sql
update "order" set payment_status = 'paid', paid_at = now(), status = 'delivered' where number = 'MRW-XXXXXX';
```

## Project map

```
src/
  app/
    page.tsx                 home (hero, manifesto, gallery, index, process)
    shop/  product/[slug]/   catalogue
    checkout/  orders/[id]/  account/  signin/
    actions/                 server actions: cart, checkout, auth
    api/auth/[...nextauth]/  Auth.js route
  auth.ts                    Auth.js + Google + Drizzle adapter
  db/                        schema, client, seed catalogue
  lib/                       cart, catalog, orders, email (Resend), formatting
  components/
    motion/                  shader, cursor, smooth scroll, reveals, marquee, preloader
    home/  shop/  checkout/  page sections and commerce UI
    object-art.tsx           procedural product renderer
scripts/seed.ts
drizzle/                     generated SQL migrations
```
