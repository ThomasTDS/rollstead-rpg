-- Invite link of a table (NT-09): one per table, valid for 7 days, for several players.
-- Only a hash of the token is stored, so reading the database never reveals a working
-- link. The link is shown once; losing it means generating a new one.

create table public.table_invites (
  table_id uuid primary key references public.game_tables (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.table_invites is 'Active invite of each table. Stores only the token hash.';

alter table public.table_invites enable row level security;

-- Column-level grant: the hash never leaves the database, not even to the master.
revoke all on table public.table_invites from anon, authenticated;
grant select (table_id, expires_at, created_at) on table public.table_invites to authenticated;

create policy "Masters read the invite of their tables"
  on public.table_invites
  for select
  to authenticated
  using (private.is_table_master(table_id));

create function private.hash_invite_token(invite_token text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(sha256(convert_to(invite_token, 'UTF8')), 'hex');
$$;

revoke all on function private.hash_invite_token(text) from public;

-- Replaces any previous invite: the old link stops working.
create function public.create_invite(target_table uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- gen_random_uuid draws from the strong random source: two of them give 244 random bits
  new_token text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
begin
  if not private.is_table_master(target_table) then
    raise exception 'only the master manages invites' using errcode = '42501';
  end if;

  insert into public.table_invites (table_id, token_hash, expires_at)
  values (target_table, private.hash_invite_token(new_token), now() + interval '7 days')
  on conflict (table_id) do update
    set token_hash = excluded.token_hash,
        expires_at = excluded.expires_at,
        created_at = now();

  return new_token;
end;
$$;

create function public.revoke_invite(target_table uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_table_master(target_table) then
    raise exception 'only the master manages invites' using errcode = '42501';
  end if;

  delete from public.table_invites where table_id = target_table;
end;
$$;

-- What the invite screen shows. No row means invalid, expired or revoked.
create function public.get_invite(invite_token text)
returns table (table_id uuid, table_name text, is_member boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select t.id, t.name, private.is_table_member(t.id)
  from public.table_invites i
  join public.game_tables t on t.id = i.table_id
  where i.token_hash = private.hash_invite_token(invite_token)
    and i.expires_at > now();
$$;

create function public.join_table(invite_token text)
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

  if (
    select count(*)
    from public.table_members
    where table_id = target_table and role = 'player'
  ) >= 8 then
    raise exception 'table_full' using errcode = 'P0001';
  end if;

  insert into public.table_members (table_id, user_id, role)
  values (target_table, (select auth.uid()), 'player');

  return target_table;
end;
$$;

revoke all on function public.create_invite(uuid) from public, anon;
revoke all on function public.revoke_invite(uuid) from public, anon;
revoke all on function public.get_invite(text) from public, anon;
revoke all on function public.join_table(text) from public, anon;
grant execute on function public.create_invite(uuid) to authenticated;
grant execute on function public.revoke_invite(uuid) to authenticated;
grant execute on function public.get_invite(text) to authenticated;
grant execute on function public.join_table(text) to authenticated;
