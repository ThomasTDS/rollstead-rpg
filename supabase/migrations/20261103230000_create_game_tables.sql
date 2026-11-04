-- Game tables and their members (NT-08, NT-11). "Table" here is the RPG table, hence
-- game_tables, to tell it apart from database tables.
--
-- Nothing writes directly to table_members through the API: members arrive through
-- server functions (create_table now, invites in NT-09), so no one can grant
-- themselves a seat or the master role.

create type public.table_role as enum ('master', 'player');

create table public.game_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint game_table_name_length check (
    name = btrim(name)
    and char_length(name) between 1 and 60
  )
);

comment on table public.game_tables is 'An RPG table: a group that plays together.';

create table public.table_members (
  table_id uuid not null references public.game_tables (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.table_role not null,
  joined_at timestamptz not null default now(),
  primary key (table_id, user_id)
);

comment on table public.table_members is 'Who sits at each table, and in which role.';

create unique index table_members_one_master
  on public.table_members (table_id)
  where role = 'master';

create index table_members_user_id on public.table_members (user_id);

-- Membership checks live outside the API schema. They run as their owner because a
-- policy on table_members that reads table_members would otherwise recurse.
create schema private;
grant usage on schema private to authenticated;

create function private.is_table_member(target_table uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.table_members
    where table_id = target_table
      and user_id = (select auth.uid())
  );
$$;

create function private.is_table_master(target_table uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.table_members
    where table_id = target_table
      and user_id = (select auth.uid())
      and role = 'master'
  );
$$;

create function private.shares_table_with(other_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.table_members mine
    join public.table_members theirs using (table_id)
    where mine.user_id = (select auth.uid())
      and theirs.user_id = other_user
  );
$$;

revoke all on function private.is_table_member(uuid) from public;
revoke all on function private.is_table_master(uuid) from public;
revoke all on function private.shares_table_with(uuid) from public;
grant execute on function private.is_table_member(uuid) to authenticated;
grant execute on function private.is_table_master(uuid) to authenticated;
grant execute on function private.shares_table_with(uuid) to authenticated;

alter table public.game_tables enable row level security;
alter table public.table_members enable row level security;

revoke all on table public.game_tables from anon, authenticated;
revoke all on table public.table_members from anon, authenticated;
grant select on table public.game_tables to authenticated;
grant update (name) on table public.game_tables to authenticated;
grant select on table public.table_members to authenticated;

create policy "Members read their tables"
  on public.game_tables
  for select
  to authenticated
  using (private.is_table_member(id));

create policy "Masters rename their tables"
  on public.game_tables
  for update
  to authenticated
  using (private.is_table_master(id))
  with check (private.is_table_master(id));

create policy "Members read who sits at their tables"
  on public.table_members
  for select
  to authenticated
  using (private.is_table_member(table_id));

create policy "Members read the names of people at their tables"
  on public.profiles
  for select
  to authenticated
  using (private.shares_table_with(id));

-- One transaction: a table can never exist without its master.
create function public.create_table(table_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_table uuid;
begin
  insert into public.game_tables (name)
  values (table_name)
  returning id into new_table;

  insert into public.table_members (table_id, user_id, role)
  values (new_table, (select auth.uid()), 'master');

  return new_table;
end;
$$;

revoke all on function public.create_table(text) from public, anon;
grant execute on function public.create_table(text) to authenticated;
