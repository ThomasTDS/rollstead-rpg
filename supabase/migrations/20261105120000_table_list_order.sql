-- NT-77: each user orders their own list of tables. A seat without a position stays on
-- top, newest first: that is how a table just created or joined reaches the top without
-- create_table and join_table knowing about the order.

alter table public.table_members add column list_position integer;

create or replace function public.list_my_tables()
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
  order by mine.list_position nulls first, mine.joined_at desc;
$$;

-- Saves the whole order at once. It only reaches the seats of the caller, so an id from
-- someone else's list changes nothing, and a table joined meanwhile keeps its place on top.
create function public.reorder_my_tables(table_ids uuid[])
returns void
language sql
security definer
set search_path = ''
as $$
  update public.table_members m
  set list_position = ordered.position
  from unnest(table_ids) with ordinality as ordered (table_id, position)
  where m.table_id = ordered.table_id
    and m.user_id = (select auth.uid());
$$;

revoke all on function public.reorder_my_tables(uuid[]) from public, anon;
grant execute on function public.reorder_my_tables(uuid[]) to authenticated;
