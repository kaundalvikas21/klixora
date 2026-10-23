-- Row level security.
--
-- The shape of it:
--
--   anon           the public site's server-side reads. Sees published,
--                  visible content and nothing else. Can insert a lead.
--   authenticated  a signed-in Supabase Auth user. Only an admin, decided by
--                  is_admin(), can read drafts or write anything.
--   service_role   bypasses RLS entirely. Used only where a Server Action
--                  genuinely needs it: counting leads to mint a reference,
--                  and writing the audit log.
--
-- Every table has RLS enabled. A table with RLS on and no matching policy
-- denies by default, which is the behaviour we want for anything unlisted.

alter table public.site_settings     enable row level security;
alter table public.working_hours     enable row level security;
alter table public.social_links      enable row level security;
alter table public.page_sections     enable row level security;
alter table public.hero_ctas         enable row level security;
alter table public.services          enable row level security;
alter table public.contact_promises  enable row level security;
alter table public.form_steps        enable row level security;
alter table public.leads             enable row level security;
alter table public.lead_notes        enable row level security;
alter table public.seo_meta          enable row level security;
alter table public.seo_defaults      enable row level security;
alter table public.media             enable row level security;
alter table public.audit_log         enable row level security;
alter table public.admin_users       enable row level security;

-- ---------------------------------------------------------------------------
-- Public content: readable by anyone, writable only by an admin.
-- ---------------------------------------------------------------------------

create policy "site settings are public"
  on public.site_settings for select to anon, authenticated using (true);

create policy "admins write site settings"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "working hours are public"
  on public.working_hours for select to anon, authenticated using (true);

create policy "admins write working hours"
  on public.working_hours for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Only the visible ones. A hidden link is not public information.
create policy "visible social links are public"
  on public.social_links for select to anon using (is_visible);

create policy "admins read every social link"
  on public.social_links for select to authenticated using (public.is_admin());

create policy "admins write social links"
  on public.social_links for insert to authenticated with check (public.is_admin());

create policy "admins update social links"
  on public.social_links for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins delete social links"
  on public.social_links for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Section copy. anon has no policy here at all: the public site reads the
-- published_sections view instead, so a draft can never leak through the
-- anon key.
-- ---------------------------------------------------------------------------

create policy "admins read page sections"
  on public.page_sections for select to authenticated using (public.is_admin());

create policy "admins write page sections"
  on public.page_sections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Structured rows: the public sees what is visible and live.
-- ---------------------------------------------------------------------------

create policy "visible ctas are public"
  on public.hero_ctas for select to anon using (is_visible);

create policy "admins read every cta"
  on public.hero_ctas for select to authenticated using (public.is_admin());

create policy "admins write ctas"
  on public.hero_ctas for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "live services are public"
  on public.services for select to anon
  using (status = 'LIVE' and is_visible);

create policy "admins read every service"
  on public.services for select to authenticated using (public.is_admin());

create policy "admins write services"
  on public.services for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "promises are public"
  on public.contact_promises for select to anon, authenticated using (true);

create policy "admins write promises"
  on public.contact_promises for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "form steps are public"
  on public.form_steps for select to anon, authenticated using (true);

create policy "admins write form steps"
  on public.form_steps for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- SEO: read by every public route's generateMetadata.
-- ---------------------------------------------------------------------------

create policy "seo meta is public"
  on public.seo_meta for select to anon, authenticated using (true);

create policy "admins write seo meta"
  on public.seo_meta for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "seo defaults are public"
  on public.seo_defaults for select to anon, authenticated using (true);

create policy "admins write seo defaults"
  on public.seo_defaults for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Leads.
--
-- Anyone may submit one. Nobody but an admin may read one back: the insert
-- policy has no matching select policy for anon, so the anon key cannot
-- enumerate submissions even though it can create them.
-- ---------------------------------------------------------------------------

create policy "anyone can submit a lead"
  on public.leads for insert to anon, authenticated
  with check (
    -- A submission always starts new and unassigned. Without this, a crafted
    -- request could post itself in as WON and assigned to someone.
    status = 'NEW'
    and assigned_to_id is null
    and first_reply_at is null
    and fit_score between 0 and 100
  );

create policy "admins read leads"
  on public.leads for select to authenticated using (public.is_admin());

create policy "admins update leads"
  on public.leads for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins delete leads"
  on public.leads for delete to authenticated using (public.is_admin());

create policy "admins read lead notes"
  on public.lead_notes for select to authenticated using (public.is_admin());

create policy "admins write lead notes"
  on public.lead_notes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Media and audit.
-- ---------------------------------------------------------------------------

-- Media rows carry public URLs that end up in <img> tags anyway.
create policy "media is public"
  on public.media for select to anon, authenticated using (true);

create policy "admins write media"
  on public.media for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Read-only to an admin, and append-only even then: an audit trail an
-- operator can edit is not an audit trail. Writes go through service_role.
create policy "admins read the audit log"
  on public.audit_log for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Admin users. An admin can see the roster, which is what the lead
-- assignment select needs, but cannot grant admin to anyone: there is no
-- insert or update policy, so membership is changed through service_role or
-- SQL only.
-- ---------------------------------------------------------------------------

create policy "admins read the roster"
  on public.admin_users for select to authenticated using (public.is_admin());
