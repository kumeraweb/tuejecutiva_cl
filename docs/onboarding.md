-- TuEjecutiva.cl — Onboarding Schema (Admin + Staging)
-- Este archivo define TODA la estructura necesaria para el onboarding manual
-- NO es público. NO se consume desde frontend público.

-- =========================================
-- 1) ONBOARDING TOKENS
-- =========================================
create table if not exists public.onboarding_tokens (
id uuid primary key default gen_random_uuid(),

email text not null,
token text not null unique,

expires_at timestamptz not null,
used_at timestamptz,

created_at timestamptz not null default now()
);

create index if not exists onboarding_tokens_token_idx
on public.onboarding_tokens(token);

-- =========================================
-- 2) ONBOARDING SUBMISSIONS (STAGING)
-- =========================================
create table if not exists public.onboarding_submissions (
id uuid primary key default gen_random_uuid(),

token_id uuid not null references public.onboarding_tokens(id) on delete restrict,

full_name text not null,
email text not null,
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
custom_category text,

accepted_terms boolean not null,
accepted_data_use boolean not null,

status text not null default 'pending'
check (status in ('pending','reviewed','approved','rejected')),

created_at timestamptz not null default now()
);

create index if not exists onboarding_submissions_status_idx
on public.onboarding_submissions(status);

-- =========================================
-- 3) ONBOARDING SUBMISSION CATEGORIES (N:N)
-- =========================================
create table if not exists public.onboarding_submission_categories (
submission_id uuid not null
references public.onboarding_submissions(id) on delete cascade,

category_id uuid not null
references public.categories(id) on delete restrict,

primary key (submission_id, category_id)
);

-- =========================================
-- 4) ONBOARDING SUBMISSION REGIONS (N:N)
-- =========================================
create table if not exists public.onboarding_submission_regions (
submission_id uuid not null
references public.onboarding_submissions(id) on delete cascade,

region_id uuid not null
references public.regions(id) on delete restrict,

primary key (submission_id, region_id)
);

-- =========================================
-- 5) ONBOARDING SUBMISSION FILES
-- =========================================
create table if not exists public.onboarding_submission_files (
id uuid primary key default gen_random_uuid(),

submission_id uuid not null
references public.onboarding_submissions(id) on delete cascade,

file_type text not null
check (file_type in ('contract','identity','other')),

file_path text not null,
file_name text not null,
mime_type text not null,

created_at timestamptz not null default now()
);

-- =========================================
-- 6) RLS — TODO BLOQUEADO POR DEFECTO
-- =========================================
alter table public.onboarding_tokens enable row level security;
alter table public.onboarding_submissions enable row level security;
alter table public.onboarding_submission_categories enable row level security;
alter table public.onboarding_submission_regions enable row level security;
alter table public.onboarding_submission_files enable row level security;

-- ❗ NO crear policies para anon
-- Solo service_role o backend controlado podrá acceder
