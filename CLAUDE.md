@AGENTS.md

# PikiPiki Market

Motorbike showroom website for Tanzania. Customers browse bikes and contact the shop by WhatsApp, phone or a call-back form. The owner manages bikes, brands, reviews and leads in a private admin panel.

- Production: https://www.pikipikimarket.com (canonical host is `www`)
- Repo: https://github.com/africanuspanga/pikipiki-market (branch `main`, deployed on Vercel)
- Audience: Tanzanian buyers on phones. The copy mixes English and Swahili. Prices are in TSh.

## Stack

| Layer | What |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, `proxy.ts` instead of middleware) |
| UI | React 19, Tailwind CSS v4 (tokens in `src/app/globals.css`), `next/font` (Barlow Condensed + Manrope) |
| Language | TypeScript 7 |
| Backend | Supabase: Postgres + Row Level Security, Auth (admin login), Storage (`product-images` bucket) |
| Supabase clients | `@supabase/supabase-js` + `@supabase/ssr` |
| Excel export | `fflate` (zip) + hand-written XLSX in `src/lib/xlsx.ts` |
| Social cards | `next/og` `ImageResponse` (`src/app/opengraph-image.tsx`) |
| Hosting | Vercel (auto-deploys from GitHub `main`) |

There's no separate API server. Pages read Supabase on the server with the anon key. The admin panel writes to Supabase straight from the browser, and RLS (`is_admin()`) decides what it can do.

## Commands

```bash
npm run dev                                   # http://localhost:3000
npm run build                                 # must pass before deploying
npm run db:setup                              # apply supabase/schema.sql (idempotent) via Management API
npm run db:seed                               # seed starter bikes from photos
npm run admin:create -- email "Password"      # add an admin user
```

Secrets are in `.env.local`, which is git-ignored and must never be committed: Supabase URL/keys, `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF`. Vercel needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Layout

```
src/app/(site)/            public site: home, /bikes (filters), /bikes/[slug] (detail), /spares
src/app/(site)/layout.tsx  navbar, footer, WhatsApp float, MotorcycleDealer JSON-LD
src/app/admin/login        admin sign-in
src/app/admin/(panel)/     dashboard, products, spares, brands, testimonials, inquiries (leads)
src/app/layout.tsx         root metadata (metadataBase = SITE.url), fonts
src/app/sitemap.ts, robots.ts, opengraph-image.tsx   SEO
src/components/site/       public UI sections
src/components/admin/      admin UI (product-form, inquiry-list, …)
src/lib/data.ts            server-side reads (published products, brands, reviews)
src/lib/format.ts          price formatting, slugify, phone number + WhatsApp links, toIntlPhone
src/lib/site.ts            SITE constants (name, url, description), SOCIALS, BRAND_LOGOS
src/lib/types.ts           DB row types, CATEGORIES, STOCK_LABELS
src/lib/video.ts           YouTube/TikTok link → embeddable iframe URL
src/lib/xlsx.ts            single-sheet .xlsx writer (every cell is text)
src/proxy.ts               refreshes the Supabase session on /admin/*
supabase/schema.sql        tables, RLS, storage policies, seed brands/reviews
```

## Data model (supabase/schema.sql)

- `brands`: name, slug, tagline, sort_order. Includes "Electric Bike" (98) and "Other" (99). "Other" is hidden from the homepage marquee and brand grid.
- `products`: specs, price/old_price, condition new/used, stock_status, features[], is_featured, is_published, `video_url` (YouTube/TikTok).
- `product_images`: ordered photos. The first one is the cover. Files live in Storage and are compressed to WebP in the browser before upload.
- `spares`: spare parts & accessories (name, category, price/old_price, fits, one photo in `image_url`/`storage_path` under `spares/{id}/` in the same bucket, stock_status in_stock/sold_out, is_published). Shown on the homepage and `/spares`.
- `testimonials`: reviews shown on the homepage.
- `inquiries`: call-back leads (name, phone, `location`, message, status new/contacted/closed, product_id). The public can only insert. Only admins can read or change them.
- `admins` + `is_admin()`: controls all write access.

## Schema changes

Edit `supabase/schema.sql` only, and keep it safe to re-run (`add column if not exists`, `on conflict do nothing`, `drop policy if exists`). Then run `npm run db:setup` and update `src/lib/types.ts`.

## Business facts

- Phone and WhatsApp: **+255 764 400 400**. It's set only in `src/lib/format.ts` (`WHATSAPP_NUMBER`, `PHONE_DISPLAY`, `PHONE_TEL`). Don't hardcode it anywhere else, and don't read it from env.
- Location: Dar es Salaam. Hours: Mon–Sat 8:00–18:00.
- Social links (`SOCIALS` in `src/lib/site.ts`): TikTok, Instagram, Facebook and YouTube, all `@pikipiki_market`.

## Features that need care

- **Sold items**: many bikes are one-of-one, so `stock_status = 'sold_out'` (labelled "Sold") keeps the listing visible but always sorted last (`soldLast` in `src/lib/format.ts`) and never featured, spotlighted or shown as related. Admins toggle it with "Mark sold" on the bikes and spares lists.
- **Leads** (`/admin/inquiries`): shows the requested bike's cover photo, the location, and Call/WhatsApp buttons. "Download Excel" exports the current tab as `.xlsx` with phones normalised to `255XXXXXXXXX` for bulk SMS.
- **Video**: the admin pastes a link. `parseVideoUrl` supports youtube.com/watch, youtu.be, /shorts, /embed and tiktok.com/…/video/ID. Short links (`vm.tiktok.com`) are rejected. The bike page embeds it with youtube-nocookie.
- **SEO**: every page has a canonical URL. Bike pages include Product + BreadcrumbList JSON-LD and use their own photos for OpenGraph. The rest use the generated share card. `/admin` is disallowed in robots and set to noindex.
- Public pages use ISR (`revalidate = 60`). Admin saves call `revalidateSite()` so changes show immediately.

## Conventions

- Match the existing style: small focused components, Tailwind utility classes, design tokens (`ink`, `bone`, `ignite`, `line`, `mute`, `night`), `font-display` for headings.
- Mobile first. The site has a bottom tab bar on phones, so leave room at the bottom (`pb-24`).
- Next.js 16 differs from older versions. Check `node_modules/next/dist/docs/` before using an API you're not sure about.
- Commits are authored by Africanus only. Don't add a Claude `Co-Authored-By` line.
