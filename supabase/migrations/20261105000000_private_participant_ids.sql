-- NT-76: a participant sees the others only as a name and a role. User ids stop reaching
-- players, who could read them in three places: table_members, profiles and master_id.
-- Everything a player sees of other people now comes from list_my_tables.

drop policy "Members read who sits at their tables" on public.table_members;

create policy "Users read their seats and masters read their tables"
  on public.table_members
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_table_master(table_id)
  );

drop policy "Members read the names of people at their tables" on public.profiles;
drop function private.shares_table_with(uuid);

-- Column grants, so select=* on this table is now refused: name the columns instead
revoke select on table public.game_tables from authenticated;
grant select (id, name, created_at) on table public.game_tables to authenticated;

-- The tables of the user, newest seat first. Master first, then players by arrival.
create function public.list_my_tables()
returns table (
  id uuid,
  name text,
  role text,
  created_at timestamptz,
  participants jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.id,
    t.name,
    case when t.master_id = (select auth.uid()) then 'master' else 'player' end,
    t.created_at,
    (
      select jsonb_agg(
        jsonb_build_object(
          'display_name', p.display_name,
          'role', case when m.user_id = t.master_id then 'master' else 'player' end
        )
        order by m.user_id = t.master_id desc, m.joined_at
      )
      from public.table_members m
      join public.profiles p on p.id = m.user_id
      where m.table_id = t.id
    )
  from public.table_members mine
  join public.game_tables t on t.id = mine.table_id
  where mine.user_id = (select auth.uid())
  order by mine.joined_at desc;
$$;

-- The only query that pairs a name with a user id, to remove players. Masters only: to
-- anyone else, including players at the table, it returns nothing.
create function public.list_table_seats(target_table uuid)
returns table (
  user_id uuid,
  display_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id, p.display_name
  from public.table_members m
  join public.profiles p on p.id = m.user_id
  where m.table_id = target_table
    and private.is_table_master(target_table)
  order by m.joined_at;
$$;

revoke all on function public.list_my_tables() from public, anon;
revoke all on function public.list_table_seats(uuid) from public, anon;
grant execute on function public.list_my_tables() to authenticated;
grant execute on function public.list_table_seats(uuid) to authenticated;
