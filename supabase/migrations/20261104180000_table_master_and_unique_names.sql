-- NT-75: table names are unique per master, and master_id becomes the single source
-- of truth for who the master is. table_members.role goes away: a role that is derived
-- cannot diverge from master_id.

alter table public.game_tables
  add column master_id uuid references public.profiles (id) on delete cascade;

update public.game_tables t
set master_id = m.user_id
from public.table_members m
where m.table_id = t.id
  and m.role = 'master';

alter table public.game_tables
  alter column master_id set not null;

-- Existing duplicates would stop the unique index below. The oldest table keeps its
-- name; the others take the first free "(2)", "(3)"... without passing the 60 characters.
do $$
declare
  duplicate record;
  counter integer;
  suffix text;
  candidate text;
begin
  for duplicate in
    select id, name, master_id
    from (
      select
        id,
        name,
        master_id,
        created_at,
        row_number() over (
          partition by master_id, lower(btrim(name))
          order by created_at, id
        ) as position
      from public.game_tables
    ) ranked
    where position > 1
    order by created_at, id
  loop
    counter := 2;
    loop
      suffix := ' (' || counter || ')';
      candidate := rtrim(left(duplicate.name, 60 - char_length(suffix))) || suffix;
      exit when not exists (
        select 1
        from public.game_tables
        where master_id = duplicate.master_id
          and lower(btrim(name)) = lower(candidate)
      );
      counter := counter + 1;
    end loop;

    update public.game_tables set name = candidate where id = duplicate.id;
  end loop;
end;
$$;

-- name never has surrounding spaces (game_table_name_length), so lower(name) is RN01.
create unique index game_tables_master_name
  on public.game_tables (master_id, lower(name));

create index game_tables_master_id on public.game_tables (master_id);

create or replace function private.is_table_master(target_table uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.game_tables
    where id = target_table
      and master_id = (select auth.uid())
  );
$$;

create or replace function public.create_table(table_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_table uuid;
begin
  insert into public.game_tables (name, master_id)
  values (btrim(table_name), (select auth.uid()))
  returning id into new_table;

  insert into public.table_members (table_id, user_id)
  values (new_table, (select auth.uid()));

  return new_table;
end;
$$;

create or replace function public.join_table(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_table uuid;
begin
  select i.table_id into target_table
  from public.table_invites i
  where i.token_hash = private.hash_invite_token(invite_token)
    and i.expires_at > now();

  if target_table is null then
    raise exception 'invite_invalid' using errcode = 'P0001';
  end if;

  -- Serializes joins of the same table, so two players can never take the last seat
  perform 1 from public.game_tables where id = target_table for update;

  if private.is_table_member(target_table) then
    return target_table;
  end if;

  -- The master holds a seat too, and does not count towards the 8 players
  if (
    select count(*)
    from public.table_members
    where table_id = target_table
  ) > 8 then
    raise exception 'table_full' using errcode = 'P0001';
  end if;

  insert into public.table_members (table_id, user_id)
  values (target_table, (select auth.uid()));

  return target_table;
end;
$$;

alter table public.table_members drop column role;
drop type public.table_role;

-- The master always holds a seat. Deferred because create_table writes the table first.
-- Added last: pending checks of a deferred constraint would block the data changes and
-- the index above when there are duplicates to rename.
alter table public.game_tables
  add constraint game_tables_master_seat
  foreign key (id, master_id)
  references public.table_members (table_id, user_id)
  deferrable initially deferred;

grant delete on table public.game_tables to authenticated;

create policy "Masters delete their tables"
  on public.game_tables
  for delete
  to authenticated
  using (private.is_table_master(id));
