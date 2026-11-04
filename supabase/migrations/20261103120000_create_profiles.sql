-- Public face of an account (NT-73): the name other players see, never the email.
-- A user with no row here has not chosen a display name yet.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint display_name_length check (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 40
  )
);

comment on table public.profiles is 'Display name of each account. Never holds the email.';

alter table public.profiles enable row level security;

-- Column-level grants: nobody can rewrite id or created_at through the API.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, display_name) on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;

-- Members of the same table will also read each other's names (added with NT-08).
create policy "Users read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Users create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy "Users rename their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
