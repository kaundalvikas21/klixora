-- Atomic lead references.
--
-- The reference used to be minted in application code: count this month's
-- rows, add one, insert. Two statements over PostgREST are two transactions,
-- so two visitors submitting in the same moment both read the same count,
-- both build the same reference, and the second insert loses to the unique
-- index on ref. The visitor who lost was told "We could not save your
-- enquiry", on the one path in this product that earns money.
--
-- The counter belongs where atomicity does. An upsert takes a row lock for
-- the duration of its own statement, so two concurrent callers are serialised
-- by Postgres and come out with different numbers. No retry loop, no advisory
-- lock, and nothing for application code to get wrong.

create table public.lead_counters (
  -- 'YYMM'. One row per month, created on that month's first enquiry.
  period     text    primary key,
  last_value integer not null default 0
);

alter table public.lead_counters enable row level security;
-- No policies: this is bookkeeping, reached only through the definer
-- function below. Nobody needs to read it, so nobody may.

-- ---------------------------------------------------------------------------
-- next_lead_ref()
--
-- Returns the whole reference rather than a bare number, so the format lives
-- in exactly one place. It used to be duplicated in TypeScript, which is the
-- kind of pair that drifts the first time somebody changes the padding.
-- ---------------------------------------------------------------------------

create or replace function public.next_lead_ref(at timestamptz default now())
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  p   text := to_char(at at time zone 'UTC', 'YYMM');
  seq integer;
begin
  insert into public.lead_counters (period, last_value)
  values (p, 1)
  on conflict (period)
  do update set last_value = public.lead_counters.last_value + 1
  returning last_value into seq;

  return 'LD-' || p || '-' || lpad(seq::text, 3, '0');
end;
$$;

revoke all on function public.next_lead_ref(timestamptz) from public;
-- The public site inserts leads as the service role, and an admin never mints
-- one by hand, so neither anon nor authenticated needs this.
grant execute on function public.next_lead_ref(timestamptz) to service_role;

-- ---------------------------------------------------------------------------
-- Existing rows keep their references; the counter starts above them so the
-- next enquiry of this month does not reuse a number already quoted to
-- somebody.
-- ---------------------------------------------------------------------------

insert into public.lead_counters (period, last_value)
select to_char(created_at at time zone 'UTC', 'YYMM'),
       count(*)::integer
from public.leads
group by 1
on conflict (period) do update
  set last_value = greatest(public.lead_counters.last_value, excluded.last_value);
