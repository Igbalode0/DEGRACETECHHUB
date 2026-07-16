-- DE-GRACE TECH HUB — product catalog schema for Supabase.
-- Run this in the Supabase SQL editor, then set in web/.env.local:
--   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY=<service role key — server only, never expose>
-- Also create a PUBLIC storage bucket named "product-images"
-- (Storage → New bucket → name: product-images → Public).

create table if not exists products (
  id         text primary key,
  name       text not null,
  slug       text not null,
  description text not null default '',
  price      integer not null,
  category   text not null,
  colors     text[] not null default '{}',
  image_url  text,
  active     boolean not null default true,
  sold_out   boolean not null default false,
  rating     text not null default '4.5',
  tag        text not null default 'New',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The app talks to this table with the service-role key from the server only,
-- so lock the table down for anonymous/authenticated API access.
alter table products enable row level security;

create policy "public can read active products"
  on products for select
  using (active = true);
