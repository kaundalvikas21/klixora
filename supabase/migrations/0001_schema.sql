-- Klixora admin data model.
--
-- Naming is snake_case throughout, which is the Postgres and PostgREST
-- convention: supabase-js returns raw column names, and the TypeScript view
-- layer in src/server/ is what maps them to camelCase for components.

create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.content_status as enum ('DRAFT', 'LIVE');
create type public.lead_status    as enum ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
create type public.cta_variant    as enum ('PRIMARY', 'OUTLINE', 'TEXT');

-- ---------------------------------------------------------------------------
-- updated_at, kept in the database rather than in application code so a write
-- from Studio or psql stamps it too.
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Site settings: exactly one row. The single source for every contact detail
-- on the public site.
-- ---------------------------------------------------------------------------

create table public.site_settings (
  id             uuid primary key default gen_random_uuid(),
  brand_name     text        not null,
  tagline        text        not null,
  domain         text        not null,
  logo_url       text,
  logo_alt       text        not null default 'Klixora',
  logo_height    integer     not null default 34,
  address_line1  text        not null,
  address_line2  text        not null,
  map_url        text,
  email          text        not null,
  phone          text        not null,
  whatsapp       text        not null,
  hours_label    text        not null,
  gstin          text,
  updated_at     timestamptz not null default now(),

  -- One row, enforced by the database rather than by convention.
  constraint site_settings_singleton check (id = id)
);

create unique index site_settings_one_row on public.site_settings ((true));

create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Working hours: exactly seven rows, day_of_week 0 = Monday.
-- This table is what search engines read. site_settings.hours_label is the
-- sentence visitors read, and the two are allowed to differ.
-- ---------------------------------------------------------------------------

create table public.working_hours (
  id          uuid primary key default gen_random_uuid(),
  day_of_week smallint not null unique check (day_of_week between 0 and 6),
  opens_at    text     check (opens_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  closes_at   text     check (closes_at ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  is_closed   boolean  not null default false,

  -- An open day needs both times; a closed day needs neither.
  constraint working_hours_times check (
    is_closed or (opens_at is not null and closes_at is not null and opens_at < closes_at)
  )
);

create table public.social_links (
  id         uuid    primary key default gen_random_uuid(),
  platform   text    not null,
  url        text    not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0
);

create index social_links_order on public.social_links (sort_order);

-- ---------------------------------------------------------------------------
-- Section copy, with a draft/published pair. The admin edits `draft`, the
-- public site renders `published`, publishing copies one over the other.
-- ---------------------------------------------------------------------------

create table public.page_sections (
  id            uuid primary key default gen_random_uuid(),
  page_slug     text        not null,
  section_key   text        not null,
  draft         jsonb       not null,
  published     jsonb,
  published_at  timestamptz,
  updated_by_id uuid,
  updated_at    timestamptz not null default now(),

  unique (page_slug, section_key)
);

create trigger page_sections_touch
  before update on public.page_sections
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Structured rows. These publish on save: visibility is governed by
-- status + is_visible rather than by a draft payload.
-- ---------------------------------------------------------------------------

create table public.hero_ctas (
  id           uuid        primary key default gen_random_uuid(),
  label        text        not null,
  href         text        not null,
  variant      public.cta_variant not null default 'OUTLINE',
  open_new_tab boolean     not null default false,
  is_visible   boolean     not null default true,
  sort_order   integer     not null default 0,
  click_count  integer     not null default 0
);

create index hero_ctas_order on public.hero_ctas (sort_order);

create table public.services (
  id          uuid        primary key default gen_random_uuid(),
  kicker      text        not null,
  title       text        not null,
  description text        not null,
  icon        text        not null,
  href        text,
  status      public.content_status not null default 'DRAFT',
  is_visible  boolean     not null default true,
  sort_order  integer     not null default 0,
  updated_at  timestamptz not null default now()
);

create index services_live on public.services (status, is_visible, sort_order);

create trigger services_touch
  before update on public.services
  for each row execute function public.touch_updated_at();

create table public.contact_promises (
  id         uuid    primary key default gen_random_uuid(),
  body       text    not null,
  sort_order integer not null default 0
);

create index contact_promises_order on public.contact_promises (sort_order);

create table public.form_steps (
  id          uuid     primary key default gen_random_uuid(),
  step_number smallint not null unique,
  question    text     not null,
  -- [{ name, label, type, required, options? }]
  fields      jsonb    not null default '[]'::jsonb
);

-- ---------------------------------------------------------------------------
-- Leads
-- ---------------------------------------------------------------------------

create table public.leads (
  id             uuid        primary key default gen_random_uuid(),
  ref            text        not null unique,
  first_name     text        not null,
  last_name      text        not null,
  company        text,
  email          text        not null,
  phone          text,
  goal           text        not null,
  budget_band    text,
  message        text,
  source         text        not null,
  utm            jsonb,
  status         public.lead_status not null default 'NEW',
  fit_score      integer     not null default 0 check (fit_score between 0 and 100),
  assigned_to_id uuid,
  first_reply_at timestamptz,
  created_at     timestamptz not null default now()
);

create index leads_status_created on public.leads (status, created_at desc);
create index leads_created on public.leads (created_at desc);

create table public.lead_notes (
  id         uuid        primary key default gen_random_uuid(),
  lead_id    uuid        not null references public.leads (id) on delete cascade,
  author_id  uuid,
  body       text        not null,
  -- 'note' is written by a person, 'event' by the system.
  kind       text        not null default 'note',
  created_at timestamptz not null default now()
);

create index lead_notes_lead on public.lead_notes (lead_id, created_at desc);

-- ---------------------------------------------------------------------------
-- SEO
-- ---------------------------------------------------------------------------

create table public.seo_meta (
  id               uuid        primary key default gen_random_uuid(),
  page_slug        text        not null unique,
  path             text        not null,
  meta_title       text        not null,
  meta_description text        not null,
  canonical_url    text,
  robots           text        not null default 'index, follow',
  og_title         text,
  og_description   text,
  og_image_url     text,
  twitter_card     text        not null default 'summary_large_image',
  focus_keywords   text[]      not null default '{}',
  schema_type      text,
  updated_at       timestamptz not null default now()
);

create trigger seo_meta_touch
  before update on public.seo_meta
  for each row execute function public.touch_updated_at();

create table public.seo_defaults (
  id               uuid primary key default gen_random_uuid(),
  title_template   text not null default '%s | Klixora',
  default_og_image text,
  twitter_handle   text,
  sitemap_url      text,
  verification     jsonb
);

create unique index seo_defaults_one_row on public.seo_defaults ((true));

-- ---------------------------------------------------------------------------
-- Media and audit
-- ---------------------------------------------------------------------------

create table public.media (
  id             uuid        primary key default gen_random_uuid(),
  url            text        not null,
  alt            text,
  width          integer,
  height         integer,
  bytes          integer,
  uploaded_by_id uuid,
  created_at     timestamptz not null default now()
);

create table public.audit_log (
  id         uuid        primary key default gen_random_uuid(),
  actor_id   uuid,
  entity     text        not null,
  entity_id  text,
  action     text        not null,
  diff       jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_created on public.audit_log (created_at desc);
