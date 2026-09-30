# PikiPiki Market

Motorbike shop for Tanzania — Next.js 16 (App Router) + Supabase + Tailwind v4.

## Run locally
```bash
npm install
npm run dev            # http://localhost:3000
```
Secrets live in `.env.local` (git-ignored — never commit it).

## Admin
- Sign in at `/admin/login`
- Add another admin: `npm run admin:create -- email@example.com "StrongPassword"`

## Database
- Schema, RLS policies, storage bucket and starter brands/reviews: `supabase/schema.sql`
- Apply (safe to re-run): `npm run db:setup`
- Seed the starter bikes from the photos: `npm run db:seed`

## Where things are
- Landing page: `src/app/(site)/page.tsx`, sections in `src/components/site/`
- Admin: `src/app/admin/`, components in `src/components/admin/`
- Brand logos: `public/brands/<slug>.png` (map in `src/lib/site.ts`)
- Phone / WhatsApp number: `WHATSAPP_NUMBER` and `PHONE_DISPLAY` in `src/lib/format.ts`
