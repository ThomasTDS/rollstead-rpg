-- NT-09 and NT-10: only the master manages the invite, and the link is the only way in.

begin;

select plan(26);

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'ana@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'bia@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'caio@example.com'),
  ('00000000-0000-0000-0000-00000000000d', 'duda@example.com');

insert into public.profiles (id, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'Ana'),
  ('00000000-0000-0000-0000-00000000000b', 'Bia'),
  ('00000000-0000-0000-0000-00000000000c', 'Caio'),
  ('00000000-0000-0000-0000-00000000000d', 'Duda');

insert into public.game_tables (id, name, master_id)
values ('10000000-0000-0000-0000-000000000001', 'Mesa da Ana', '00000000-0000-0000-0000-00000000000a');

insert into public.table_members (table_id, user_id)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b');

-- The real token, generated as Ana, is kept here so the other roles can use it
create temporary table test_token (token text);
grant all on test_token to authenticated;

select has_table('public', 'table_invites', 'table_invites exists');
select hasnt_column('public', 'table_invites', 'token', 'the plain token is never stored');

-- Anonymous visitors
set local role anon;

select throws_ok($$ select * from public.table_invites $$, '42501', null, 'anon cannot read invites');
select throws_ok(
  $$ select public.create_invite('10000000-0000-0000-0000-000000000001') $$,
  '42501',
  null,
  'anon cannot create an invite'
);
select throws_ok($$ select public.join_table('anything') $$, '42501', null, 'anon cannot join a table');

-- Ana: master
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

insert into test_token
select public.create_invite('10000000-0000-0000-0000-000000000001');

select is(
  (select count(*) from public.table_invites)::int,
  1,
  'the master reads the invite of the table'
);
select throws_ok(
  $$ select token_hash from public.table_invites $$,
  '42501',
  null,
  'not even the master reads the hash'
);

-- Bia: player
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);

select is_empty($$ select 1 from public.table_invites $$, 'a player does not read the invite');
select throws_ok(
  $$ select public.create_invite('10000000-0000-0000-0000-000000000001') $$,
  '42501',
  null,
  'a player cannot create an invite'
);
select throws_ok(
  $$ select public.revoke_invite('10000000-0000-0000-0000-000000000001') $$,
  '42501',
  null,
  'a player cannot revoke an invite'
);
select lives_ok(
  $$ select public.join_table((select token from test_token)) $$,
  'a member opening the link again changes nothing'
);

-- Caio: outsider with the link
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c"}', true);

select is_empty($$ select 1 from public.table_invites $$, 'an outsider does not read the invite');
select throws_ok(
  $$ select public.create_invite('10000000-0000-0000-0000-000000000001') $$,
  '42501',
  null,
  'an outsider cannot create an invite'
);
select results_eq(
  $$ select table_name, is_member from public.get_invite((select token from test_token)) $$,
  $$ values ('Mesa da Ana', false) $$,
  'the link shows the name of the table, and nothing else'
);
select is_empty($$ select * from public.get_invite('tampered') $$, 'a tampered link shows nothing');
select throws_ok($$ select public.join_table('tampered') $$, 'P0001', 'invite_invalid', 'a tampered link is refused');
select lives_ok($$ select public.join_table((select token from test_token)) $$, 'the link lets a new player in');
select results_eq(
  $$ select is_member from public.get_invite((select token from test_token)) $$,
  $$ values (true) $$,
  'once inside, the link says so'
);

-- Superuser checks of the result and of the limits
reset role;

select results_eq(
  $$ select t.master_id
     from public.table_members m
     join public.game_tables t on t.id = m.table_id
     where m.user_id = '00000000-0000-0000-0000-00000000000c' $$,
  $$ values ('00000000-0000-0000-0000-00000000000a'::uuid) $$,
  'a new member joins as a player: the master stays the same'
);
select results_eq(
  $$ select count(*) from public.table_members where user_id = '00000000-0000-0000-0000-00000000000b' $$,
  $$ values (1::bigint) $$,
  'opening the link again does not duplicate the seat'
);

update public.table_invites set expires_at = now() - interval '1 minute';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d"}', true);

select is_empty(
  $$ select * from public.get_invite((select token from test_token)) $$,
  'an expired link shows nothing'
);
select throws_ok(
  $$ select public.join_table((select token from test_token)) $$,
  'P0001',
  'invite_invalid',
  'an expired link is refused'
);

-- A table with 8 players is full, and the master does not count
reset role;
update public.table_invites set expires_at = now() + interval '7 days';

insert into auth.users (id, email)
select gen_random_uuid(), 'filler' || n || '@example.com' from generate_series(1, 6) n;
insert into public.profiles (id, display_name)
select id, 'Filler' from auth.users where email like 'filler%';
insert into public.table_members (table_id, user_id)
select '10000000-0000-0000-0000-000000000001', id from public.profiles where display_name = 'Filler';

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d"}', true);

select throws_ok(
  $$ select public.join_table((select token from test_token)) $$,
  'P0001',
  'table_full',
  'a full table refuses a ninth player'
);

-- Ana revokes: the link stops working
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select lives_ok(
  $$ select public.revoke_invite('10000000-0000-0000-0000-000000000001') $$,
  'the master revokes the invite'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d"}', true);

select throws_ok(
  $$ select public.join_table((select token from test_token)) $$,
  'P0001',
  'invite_invalid',
  'a revoked link is refused'
);

-- A new link replaces the old one
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select isnt(
  public.create_invite('10000000-0000-0000-0000-000000000001'),
  (select token from test_token),
  'each new link is different'
);

select * from finish();

rollback;
