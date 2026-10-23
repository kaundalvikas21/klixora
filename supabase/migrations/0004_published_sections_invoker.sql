-- published_sections, without the SECURITY DEFINER view.
--
-- The view exists because page_sections holds unpublished drafts in the same
-- row as the published copy, and row level security cannot hide a column. A
-- definer view solved that by reading the base table as its owner, so anon
-- never needed select on page_sections at all.
--
-- That trips Supabase's database linter (0010_security_definer_view), and the
-- warning is fair: a definer view bypasses the caller's policies, so it is
-- only ever as safe as its own WHERE clause. The same guarantee is available
-- without the bypass, from two things Postgres already has:
--
--   a column grant   anon may read page_slug, section_key, published and
--                    published_at. Not draft. Column privileges are checked
--                    before policies, so this is what RLS could not express.
--
--   a row policy     anon may see a row only once it has been published.
--
-- With both in place the view can run as the caller and still show nothing a
-- draft could leak through. `authenticated` is deliberately left alone: the
-- admin edits drafts, so it keeps select on every column, and the existing
-- is_admin() policy is what decides whether it sees anything.

create policy "published sections are public"
  on public.page_sections for select to anon
  using (published is not null);

revoke select on public.page_sections from anon;

grant select (page_slug, section_key, published, published_at)
  on public.page_sections to anon;

alter view public.published_sections set (security_invoker = on);
