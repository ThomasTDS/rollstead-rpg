-- NT-76: participants see each other only as a name and a role.

begin;

select plan(15);

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
values ('10000000-0000-0000-0000-000000000001', 'DnD', '00000000-0000-0000-0000-00000000000a');

-- Caio arrived first among the players, and the master last of all: the order must
-- come from master_id, not from arrival alone
insert into public.table_members (table_id, user_id, joined_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', '2026-01-01'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', '2026-01-02'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', '2026-01-03');

select has_function_privilege('anon', 'public.list_my_tables()', 'execute') = false
  as anon_denied into temporary test_anon;
select ok((select anon_denied from test_anon), 'anon cannot call list_my_tables');

-- Bia: player
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);

select results_eq(
  $$ select name, role from public.list_my_tables() $$,
  $$ values ('DnD', 'player') $$,
  'a player gets the table and their role'
);
select results_eq(
  $$ select participants from public.list_my_tables() $$,
  $$ values ('[{"display_name":"Ana","role":"master"},
               {"display_name":"Caio","role":"player"},
               {"display_name":"Bia","role":"player"}]'::jsonb) $$,
  'the master comes first, then the players by arrival, with only name and role'
);
select is_empty(
  $$ select public.list_table_seats('10000000-0000-0000-0000-000000000001') $$,
  'a player gets nothing from the master query'
);
select results_eq(
  $$ select user_id from public.table_members $$,
  $$ values ('00000000-0000-0000-0000-00000000000b'::uuid) $$,
  'a player reads only their own seat'
);
select results_eq(
  $$ select id from public.profiles $$,
  $$ values ('00000000-0000-0000-0000-00000000000b'::uuid) $$,
  'a player reads only their own profile'
);
select throws_ok(
  $$ select master_id from public.game_tables $$,
  '42501',
  null,
  'a player cannot read master_id'
);
select lives_ok(
  $$ select id, name, created_at from public.game_tables $$,
  'the other columns of the table stay readable'
);

-- Duda: outside the table
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d"}', true);

select is_empty($$ select id from public.list_my_tables() $$, 'an outsider gets no tables');
select is_empty(
  $$ select public.list_table_seats('10000000-0000-0000-0000-000000000001') $$,
  'an outsider gets nothing from the master query'
);

-- Ana: master
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select results_eq(
  $$ select role from public.list_my_tables() $$,
  $$ values ('master') $$,
  'the master gets their role'
);
select results_eq(
  $$ select user_id, display_name from public.list_table_seats('10000000-0000-0000-0000-000000000001') $$,
  $$ values
     ('00000000-0000-0000-0000-00000000000c'::uuid, 'Caio'),
     ('00000000-0000-0000-0000-00000000000b'::uuid, 'Bia'),
     ('00000000-0000-0000-0000-00000000000a'::uuid, 'Ana') $$,
  'the master gets the ids, in order of arrival'
);
select results_eq(
  $$ select count(*)::int from public.table_members $$,
  $$ values (3) $$,
  'the master reads every seat of their table'
);
select lives_ok(
  $$ delete from public.table_members where user_id = '00000000-0000-0000-0000-00000000000b' $$,
  'the master still removes a player'
);
select results_eq(
  $$ select jsonb_array_length(participants) from public.list_my_tables() $$,
  $$ values (2) $$,
  'whoever leaves disappears from the list'
);

select * from finish();

rollback;
