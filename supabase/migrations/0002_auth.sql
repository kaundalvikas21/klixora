-- Admin identity.
--
-- Operators are Supabase Auth users. This table is the allowlist that turns
-- an authenticated user into an admin, and `is_admin()` is what every policy
-- in 0003_rls.sql asks.

create table public.admin_users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  name       text not null default 'Klixora Admin',
  role       text not null default 'ADMIN',
  created_at timestamptz not null default now()
);

-- Foreign keys that point at a person, now that auth.users is the source.
alter table public.leads
  add constraint leads_assigned_to_fkey
  foreign key (assigned_to_id) references public.admin_users (id) on delete set null;

-- ---------------------------------------------------------------------------
-- is_admin()
--
-- SECURITY DEFINER so it can read admin_users from inside a policy on
-- admin_users itself without recursing. STABLE so the planner calls it once
-- per statement rather than once per row.
--
-- search_path is pinned: a SECURITY DEFINER function that resolves names
-- through the caller's search_path is a privilege-escalation hole.
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_users where id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Hero CTA click counter.
--
-- A definer function rather than an anon UPDATE policy: the public site must
-- be able to add 1 to one column, and nothing else. A table-level update
-- policy cannot express "this column only".
-- ---------------------------------------------------------------------------

create or replace function public.increment_cta_click(cta_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.hero_ctas set click_count = click_count + 1 where id = cta_id;
$$;

revoke all on function public.increment_cta_click(uuid) from public;
grant execute on function public.increment_cta_click(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Published section copy, for the public site.
--
-- page_sections holds unpublished drafts, and row-level security cannot hide
-- a column. This view exposes only what has been published.
--
-- It is created with the Postgres default, SECURITY DEFINER, so reading it
-- does not need select on the base table. 0004 turns that off and replaces it
-- with a column grant plus a row policy, which gives the same guarantee
-- without the view bypassing the caller's own policies.
-- ---------------------------------------------------------------------------

create view public.published_sections as
  select page_slug, section_key, published, published_at
  from public.page_sections
  where published is not null;

grant select on public.published_sections to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: one public bucket for admin uploads (logo, OG images, hero
-- backdrop). Public read because every URL ends up in an <img> or an og:image.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  4194304, -- 4MB, matching the Server Action's own check
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "admins upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "admins replace media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "admins delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
