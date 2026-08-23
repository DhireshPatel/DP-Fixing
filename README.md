# DP Fixing — Electrician Service Booking Platform

A production-oriented electrician service booking website built with:

- **Next.js (App Router)** — JavaScript only, no TypeScript
- **Plain CSS / CSS Modules** — no Tailwind
- **Supabase (PostgreSQL)** — via `@supabase/supabase-js`
- **Telegram Bot API** for admin booking notifications
- **WhatsApp click-to-chat** for assigning service men
- **Geoapify** for address search & reverse geocoding
- **Browser Geolocation API** for "use my current location"

---

## 1. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard, paste the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates all
   5 tables (`services`, `bookings`, `service_men`, `admins`, `settings`),
   indexes, `updated_at` triggers, and Row Level Security policies.
3. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**keep this secret**)

## 2. Getting Started

```bash
npm install
cp .env.example .env.local
# edit .env.local with your real Supabase, Telegram and Geoapify values
npm run seed     # populates 30 services, a demo admin account, and default settings
npm run dev      # starts the dev server on http://localhost:3000
```

Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for the browser, currently unused directly but reserved) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** key used by all API routes to read/write the database, bypassing RLS. Never expose this to the browser. |
| `ADMIN_JWT_SECRET` | Long random string used to sign the admin session token |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed` to create the first admin account |
| `TELEGRAM_BOT_TOKEN` | Token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | The chat ID that should receive new-booking notifications |
| `GEOAPIFY_API_KEY` | Free API key from [geoapify.com](https://www.geoapify.com/) |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Displayed business phone number |

None of the secret keys are ever exposed to the browser — Supabase (service role), Telegram and Geoapify calls all happen inside server-side API routes (`app/api/**`). Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_BUSINESS_PHONE` are public by design.

### Getting a Telegram Chat ID
1. Create a bot via [@BotFather](https://t.me/BotFather) and copy the token.
2. Message your bot (or add it to a group).
3. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` and find the `chat.id` field.

## 4. Seeding the Database

`npm run seed` will:
- Insert all 30 electrician services (with real Unsplash stock photography, not icons)
- Create one admin account (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Fill in default settings: ₹100 visiting fee, a 20km Jodhpur service area, and standard time slots

It's safe to re-run — it skips services/admin that already exist, and only fills in settings defaults if they're still empty.

## 5. Project Structure

```
app/                    Pages & API routes (Next.js App Router)
  admin/                Admin login, dashboard, bookings, services, service-men, settings
  api/                  Route handlers (services, bookings, service-men, location, admin, settings)
  services/, cart/, checkout/, booking-success/, about/, contact/
components/             Reusable UI components (Navbar, ServiceCard, BookingForm, etc.)
context/                CartContext & LocationContext (localStorage-backed)
supabase/schema.sql     PostgreSQL schema — tables, indexes, triggers, RLS policies
lib/                    Server-only utilities:
                          supabase.js (Supabase clients), mappers.js (DB row <-> app object),
                          distance.js (Haversine), telegram.js, whatsapp.js, auth.js
utils/                  Shared helpers: validation, reverseGeocode (client fetch wrappers)
scripts/seed.js         Database seeding script (Supabase)
```

## 6. Key Behaviors & Security Notes

- **Prices are never trusted from the browser.** On booking submission, the server re-fetches each service from Supabase, recalculates the subtotal and total using the current visiting fee, and ignores any totals sent from the client.
- **Service-area checks run twice** — once in the browser for immediate feedback, and again on the server before a booking is created, using Haversine distance against admin-configured service areas stored in the `settings` table.
- **Admin routes are protected** by an HTTP-only JWT cookie (`lib/auth.js`), independent of Supabase — the `admins` table just stores `email` + bcrypt `password_hash`. The admin layout (`app/admin/layout.js`) redirects unauthenticated users to `/admin/login`, and every admin API route re-verifies the cookie server-side.
- **All database access goes through the Supabase service-role client** (`lib/supabase.js` → `getSupabaseAdmin()`), used only inside `app/api/**` route handlers and server components — never in client components. Row Level Security is enabled on every table as defense-in-depth, with a public read-only policy on active `services` only.
- **Telegram & Geoapify credentials never reach the client.** All calls happen inside API routes.
- **Nearest service-man matching** (`/api/service-men/match`) filters by active status, matching service, working day, and working-hours overlap with the requested time slot, then sorts by Haversine distance. The admin manually confirms assignment — nothing is auto-assigned.
- **WhatsApp messages are click-to-chat only** (`wa.me` links) — no unofficial WhatsApp automation API is used.

## 7. Data Model (Postgres tables)

| Table | Purpose |
|---|---|
| `services` | Catalog of electrician services (name, price, duration, image, etc.) |
| `service_men` | Electricians: location, services offered, working days/hours |
| `bookings` | Customer bookings with embedded `services` JSONB snapshot, location, status |
| `admins` | Admin login credentials (email + bcrypt hash) |
| `settings` | Singleton row: visiting fee, service areas, time slots, working hours |

See `supabase/schema.sql` for full column definitions, constraints, and indexes.

## 8. Service Images

Service card images use real stock photography (Unsplash) rather than icons, per the project requirements. For a real production launch, consider uploading your own photos to a **Supabase Storage** bucket and referencing the public URLs from **Admin → Services** instead of hotlinking Unsplash.

## 9. Deployment Notes

- Any Node.js host that supports Next.js (Vercel, Render, a VPS with PM2, etc.) will work.
- Set all environment variables from `.env.example` in your hosting provider's dashboard.
- Make sure outbound HTTPS requests to `api.telegram.org`, `api.geoapify.com`, and your Supabase project URL are allowed from your server.
- Run `npm run build && npm start` for production.

## 10. What's Included vs. Suggested Next Steps

Included: full customer booking flow (browse → cart → checkout → location → booking), full admin flow (login → dashboard → bookings → nearest-service-man matching → WhatsApp assignment → status updates → services/service-men/settings management), server-side price & service-area validation, Telegram notifications, complete Supabase/Postgres schema with RLS.

Good next steps for a real launch: Supabase Storage for service images (instead of pasting image URLs), SMS/email confirmations for customers, pagination on the admin bookings table, and automated tests around the booking and matching APIs.
