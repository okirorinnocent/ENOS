-- SAMARITAN AGRO-DEALERS: run once in Supabase > SQL Editor.
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  category text not null check (category in ('Herbicides','Insecticides','Fungicides','Fertilizers','Seeds','Veterinary','Equipment')),
  active_ingredient text,
  packs text[] not null default '{}',     -- pack sizes, e.g. {'1 L','5 L'}
  price numeric,                          -- optional "from" price in UGX
  in_stock boolean not null default true,
  crops text[] not null default '{}',
  problems text[] not null default '{}',
  controls text, dosage text, application text, pre_harvest text, safety text,
  rate_per_ha numeric, unit text check (unit in ('L','kg')),
  image_url text
);

alter table public.admins   enable row level security;
alter table public.products enable row level security;

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- Everyone can read products; only admins can change them.
create policy "products read"   on public.products for select using (true);
create policy "products insert" on public.products for insert to authenticated with check (public.is_admin());
create policy "products update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products delete" on public.products for delete to authenticated using (public.is_admin());
create policy "admins self-check" on public.admins for select to authenticated using (user_id = auth.uid());

-- Public image bucket; only admins upload or delete.
insert into storage.buckets (id, name, public) values ('product-images','product-images',true) on conflict (id) do nothing;
create policy "images read"   on storage.objects for select using (bucket_id = 'product-images');
create policy "images insert" on storage.objects for insert to authenticated with check (bucket_id='product-images' and public.is_admin());
create policy "images delete" on storage.objects for delete to authenticated using (bucket_id='product-images' and public.is_admin());

-- AFTER creating your admin user (Authentication > Users > Add user), make them an admin:
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL-HERE';
