-- Close two RPCs that were reachable without signing in.
--
-- 0005 and 0006 both said `revoke all on function ... from public` and then
-- granted to the one role that needed it. On a hosted Supabase project that
-- is not enough: ALTER DEFAULT PRIVILEGES grants EXECUTE to anon,
-- authenticated and service_role explicitly at creation time, and revoking
-- from PUBLIC does not touch an explicit grant to a named role. Both
-- functions ended up callable from the anon key through /rest/v1/rpc/.
--
-- next_lead_ref was the one that mattered: it is a write. Anyone could call
-- it in a loop and run the month's counter up, so the next real enquiry would
-- be quoted a reference like LD-2610-984. No data leaks, nothing is lost, but
-- the numbering an operator reads back to a client over the phone would be
-- nonsense.
--
-- mark_notifications_seen is harmless by construction, since it keys off
-- auth.uid() and an anonymous caller has none, so it updates no rows. It is
-- closed anyway: a function that can only ever be a no-op for a role should
-- not be in that role's API surface at all.
--
-- is_admin and increment_cta_click keep their anon grant. Those are
-- deliberate, and 0002 explains why.

revoke execute on function public.next_lead_ref(timestamptz) from anon, authenticated;
revoke execute on function public.mark_notifications_seen() from anon;
