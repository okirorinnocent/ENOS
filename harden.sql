-- Run once in Supabase SQL Editor: database-level safeguards (the admin page also checks these).
delete from public.products a using public.products b where a.id > b.id and lower(a.name) = lower(b.name);  -- removes accidental duplicates, keeps the oldest
create unique index if not exists products_name_unique on public.products (lower(name));
do $$ begin
  alter table public.products add constraint products_price_ok check (price is null or price >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.products add constraint products_rate_ok check (rate_per_ha is null or (rate_per_ha > 0 and unit is not null));
exception when duplicate_object then null; end $$;
update public.products set crops = array(select initcap(x) from unnest(crops) x), problems = array(select initcap(x) from unnest(problems) x);  -- tidy old typed values
