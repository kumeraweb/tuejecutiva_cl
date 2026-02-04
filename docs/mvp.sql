-- TuEjecutiva.cl — Supabase MVP Schema (1:1 con docs/supabase-spec.md)
-- Ejecutar en Supabase SQL Editor en un proyecto NUEVO

-- 0) Extensión para UUID
create extension if not exists "pgcrypto";

-- 1) CATEGORIES (catálogo público)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

-- 2) REGIONS (catálogo público)
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- RM, V, VIII, etc.
  name text not null,
  created_at timestamptz not null default now()
);

-- 3) EXECUTIVES (publicadas)
create table if not exists public.executives (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,

  phone text not null,
  company text not null,

  experience_years integer,

  specialty text,
  description text,

  whatsapp_message text,

  photo_url text,
  company_logo_url text,

  faq jsonb,

  coverage_all boolean not null default false,

  plan text not null default 'bronce'
    check (plan in ('bronce','plata','oro')),

  verified boolean not null default false,
  verified_date date,

  status text not null default 'pending'
    check (status in ('draft','pending','active','inactive')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists executives_status_idx
  on public.executives(status);

create index if not exists executives_coverage_all_idx
  on public.executives(coverage_all);

create index if not exists executives_plan_idx
  on public.executives(plan);

-- 4) EXECUTIVE_CATEGORIES (N:N)
create table if not exists public.executive_categories (
  executive_id uuid not null references public.executives(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (executive_id, category_id)
);

create index if not exists executive_categories_category_id_idx
  on public.executive_categories(category_id);

-- 5) EXECUTIVE_REGIONS (N:N)
create table if not exists public.executive_regions (
  executive_id uuid not null references public.executives(id) on delete cascade,
  region_id uuid not null references public.regions(id) on delete cascade,
  primary key (executive_id, region_id)
);

create index if not exists executive_regions_region_id_idx
  on public.executive_regions(region_id);

-- 6) ONBOARDING_SUBMISSIONS (staging privado)
-- Esta tabla NO se renderiza en público y NO debe ser accesible desde el frontend.
create table if not exists public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  phone text not null,
  company text not null,

  specialty text,
  description text,
  whatsapp_message text,

  photo_url text,
  company_logo_url text,

  faq jsonb,

  coverage_all boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists onboarding_submissions_created_at_idx
  on public.onboarding_submissions(created_at);

-- 7) Trigger updated_at para executives
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists executives_set_updated_at on public.executives;
create trigger executives_set_updated_at
before update on public.executives
for each row execute function public.set_updated_at();

-- 8) RLS: activado en TODO
alter table public.categories enable row level security;
alter table public.regions enable row level security;
alter table public.executives enable row level security;
alter table public.executive_categories enable row level security;
alter table public.executive_regions enable row level security;
alter table public.onboarding_submissions enable row level security;

-- 9) Políticas SOLO LECTURA (anon) para las tablas públicas
-- categories: lectura pública
drop policy if exists "public_read_categories" on public.categories;
create policy "public_read_categories"
on public.categories
for select
to anon
using (true);

-- regions: lectura pública
drop policy if exists "public_read_regions" on public.regions;
create policy "public_read_regions"
on public.regions
for select
to anon
using (true);

-- executives: lectura pública SOLO activos
drop policy if exists "public_read_executives_active" on public.executives;
create policy "public_read_executives_active"
on public.executives
for select
to anon
using (status = 'active');

-- executive_categories: lectura pública (se usa para joins)
drop policy if exists "public_read_executive_categories" on public.executive_categories;
create policy "public_read_executive_categories"
on public.executive_categories
for select
to anon
using (true);

-- executive_regions: lectura pública (se usa para joins)
drop policy if exists "public_read_executive_regions" on public.executive_regions;
create policy "public_read_executive_regions"
on public.executive_regions
for select
to anon
using (true);

-- 10) Importante: NO creamos políticas para onboarding_submissions.
-- Resultado:
-- - anon NO puede leer ni insertar
-- - service_role (backend) sí podrá insertar si lo usas en Next.js



-- 👉 Esta es la query que debe usar el frontend para listar ejecutivas por categoría, con regiones y cobertura. :

select
  e.id,
  e.name,
  e.slug,
  e.phone,
  e.company,
  e.specialty,
  e.description,
  e.photo_url,
  e.company_logo_url,
  e.faq,
  e.coverage_all,
  e.verified,
  e.verified_date,

  c.slug as category_slug,
  c.name as category_name,

  coalesce(
    json_agg(
      json_build_object(
        'code', r.code,
        'name', r.name
      )
    ) filter (where r.id is not null),
    '[]'
  ) as regions

from public.executives e
join public.executive_categories ec on ec.executive_id = e.id
join public.categories c on c.id = ec.category_id
left join public.executive_regions er on er.executive_id = e.id
left join public.regions r on r.id = er.region_id

where
  e.status = 'active'
  and c.slug = :category_slug

group by
  e.id,
  c.slug,
  c.name

order by e.created_at desc;