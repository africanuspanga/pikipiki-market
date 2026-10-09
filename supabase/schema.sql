-- PikiPiki Market — database schema
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.

create extension if not exists "pgcrypto";

-- ───────────────────────── Admins ─────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ───────────────────────── Brands ─────────────────────────
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  tagline text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ──────────────────────── Products ────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand_id uuid references public.brands (id) on delete set null,
  category text not null default 'Commuter',
  condition text not null default 'new' check (condition in ('new', 'used')),
  price numeric(14, 0) not null default 0,
  old_price numeric(14, 0),
  year int,
  engine_cc int,
  mileage_km int,
  fuel_type text default 'Petrol',
  transmission text default 'Manual',
  top_speed_kmh int,
  fuel_economy text,
  color text,
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low_stock', 'sold_out', 'pre_order')),
  short_description text,
  description text,
  features text[] not null default '{}',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- YouTube / TikTok link shown as an embedded player on the bike page.
alter table public.products add column if not exists video_url text;

create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_published_idx on public.products (is_published, created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  storage_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ────────────────────── Testimonials ──────────────────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  rating numeric(2, 1) not null default 5 check (rating >= 1 and rating <= 5),
  content text not null,
  bike text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─────────────────────── Inquiries ────────────────────────
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  phone text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.inquiries add column if not exists location text;

-- ───────────────── Spares & accessories ───────────────────
create table if not exists public.spares (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Spare part',
  price numeric(14, 0) not null default 0,
  old_price numeric(14, 0),
  fits text, -- which bikes the part fits, e.g. "Boxer 150, TVS HLX"
  description text,
  image_url text,
  storage_path text,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'sold_out')),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists spares_published_idx on public.spares (is_published, created_at desc);

drop trigger if exists spares_touch on public.spares;
create trigger spares_touch before update on public.spares
  for each row execute function public.touch_updated_at();

-- ─────────────────────────── RLS ──────────────────────────
alter table public.admins enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.testimonials enable row level security;
alter table public.inquiries enable row level security;
alter table public.spares enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

drop policy if exists "brands public read" on public.brands;
create policy "brands public read" on public.brands for select using (true);
drop policy if exists "brands admin write" on public.brands;
create policy "brands admin write" on public.brands for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (is_published or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "images public read" on public.product_images;
create policy "images public read" on public.product_images for select using (true);
drop policy if exists "images admin write" on public.product_images;
create policy "images admin write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "testimonials public read" on public.testimonials;
create policy "testimonials public read" on public.testimonials for select using (is_published or public.is_admin());
drop policy if exists "testimonials admin write" on public.testimonials;
create policy "testimonials admin write" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries public insert" on public.inquiries;
create policy "inquiries public insert" on public.inquiries for insert with check (true);
drop policy if exists "inquiries admin all" on public.inquiries;
create policy "inquiries admin all" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "spares public read" on public.spares;
create policy "spares public read" on public.spares for select using (is_published or public.is_admin());
drop policy if exists "spares admin write" on public.spares;
create policy "spares admin write" on public.spares for all using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Storage ────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- ───────────────────────── Seed data ──────────────────────
insert into public.brands (name, slug, tagline, sort_order) values
  ('Sinoray', 'sinoray', 'Built for daily hustle', 1),
  ('Honda', 'honda', 'The power of dreams', 2),
  ('Boxer', 'boxer', 'Tough on every road', 3),
  ('TVS', 'tvs', 'Reliable & fuel-smart', 4),
  ('KTM', 'ktm', 'Ready to race', 5),
  ('Yamaha', 'yamaha', 'Revs your heart', 6),
  ('Ducati', 'ducati', 'Italian performance', 7),
  ('Haojue', 'haojue', 'Strong & affordable', 8),
  ('Electric Bike', 'electric-bike', 'Zero fuel, all ride', 98),
  ('Other', 'other', 'More makes in stock', 99)
on conflict (slug) do nothing;

insert into public.testimonials (name, location, rating, content, bike, sort_order)
select * from (values
  ('Juma M.', 'Dar es Salaam', 5.0, 'Nilipata Boxer yangu ndani ya siku moja. Huduma nzuri sana na bei ni poa kabisa. Asanteni!', 'Bajaj Boxer 150', 1),
  ('Neema K.', 'Arusha', 5.0, 'Very professional team. They explained every detail and delivered the bike to Arusha safely.', 'Honda CB 125', 2),
  ('Baraka S.', 'Mwanza', 4.5, 'Great prices and genuine bikes. Paperwork and registration was handled quickly.', 'TVS Apache RTR 160', 3),
  ('Rehema A.', 'Dodoma', 5.0, 'My boda business started with a Haojue from PikiPiki Market. Strong bike, fair price.', 'Haojue HJ150', 4),
  ('Emmanuel T.', 'Moshi', 4.5, 'Quick replies on WhatsApp and honest advice. I will buy my next bike here.', 'Yamaha Crux', 5),
  ('Salim H.', 'Zanzibar', 5.0, 'The KTM Duke was exactly as described. Smooth process from start to finish.', 'KTM Duke 200', 6),
  ('Grace P.', 'Mbeya', 5.0, 'Walinisaidia kuchagua pikipiki inayofaa bajeti yangu. Nashukuru sana!', 'Sinoray SR150', 7),
  ('Daudi L.', 'Tanga', 4.5, 'Clean showroom, clear pricing, no hidden charges. Recommended.', 'TVS HLX 125', 8)
) as t(name, location, rating, content, bike, sort_order)
where not exists (select 1 from public.testimonials);
