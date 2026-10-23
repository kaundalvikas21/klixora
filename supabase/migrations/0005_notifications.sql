-- Lead notifications for the admin header.
--
-- "Unread" is one timestamp per operator rather than a row per notification.
-- A notification here is not a thing in its own right: it is a lead that
-- arrived after the last time this operator looked. A read-marker table would
-- need a row per lead per operator, and would have to be swept, for an answer
-- a single column already gives.
--
-- It is per operator, not global, so one person clearing the bell does not
-- clear it for everyone.

alter table public.admin_users
  add column notifications_seen_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Marking them read.
--
-- admin_users deliberately has no update policy: membership and role are not
-- things an admin may edit, which is what keeps is_admin() trustworthy. A
-- definer function is how one column becomes writable without opening the
-- row, the same shape as increment_cta_click.
--
-- It writes only to the caller's own row, so an admin cannot clear anyone
-- else's bell either.
-- ---------------------------------------------------------------------------

create or replace function public.mark_notifications_seen()
returns timestamptz
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.admin_users
     set notifications_seen_at = now()
   where id = (select auth.uid())
  returning notifications_seen_at;
$$;

revoke all on function public.mark_notifications_seen() from public;
grant execute on function public.mark_notifications_seen() to authenticated;
