-- NT-74: the master removes players, a player leaves, and nobody else touches a seat.

begin;

select plan(11);

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

insert into public.table_members (table_id, user_id)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c');

-- Bia: player. Removing someone else reaches no row
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);
select lives_ok(
  $$ delete from public.table_members where user_id = '00000000-0000-0000-0000-00000000000c' $$,
  'a player removing another player runs but reaches no row'
);

-- Duda: outside the table
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d"}', true);
select lives_ok(
  $$ delete from public.table_members where table_id = '10000000-0000-0000-0000-000000000001' $$,
  'someone outside the table reaches no row'
);

reset role;
select results_eq(
  $$ select count(*)::int from public.table_members where table_id = '10000000-0000-0000-0000-000000000001' $$,
  $$ values (3) $$,
  'every seat survived those attempts'
);

-- Ana: master
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);
select throws_ok(
  $$ set constraints public.game_tables_master_seat immediate;
     delete from public.table_members where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  '23503',
  null,
  'the master cannot leave their own table'
);
select lives_ok(
  $$ delete from public.table_members where user_id = '00000000-0000-0000-0000-00000000000b' $$,
  'the master removes a player'
);

-- Bia: removed
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);
select is_empty(
  $$ select 1 from public.game_tables where id = '10000000-0000-0000-0000-000000000001' $$,
  'a removed player no longer sees the table'
);
select is_empty(
  $$ select 1 from public.table_members where table_id = '10000000-0000-0000-0000-000000000001' $$,
  'a removed player no longer sees the seats'
);
select is_empty(
  $$ select 1 from public.list_my_tables() $$,
  'a removed player no longer reads the names of that table'
);

-- Caio: player
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c"}', true);
select lives_ok(
  $$ delete from public.table_members where user_id = '00000000-0000-0000-0000-00000000000c' $$,
  'a player leaves on their own'
);

reset role;
select results_eq(
  $$ select user_id from public.table_members where table_id = '10000000-0000-0000-0000-000000000001' $$,
  $$ values ('00000000-0000-0000-0000-00000000000a'::uuid) $$,
  'only the master remains'
);

-- Seats are still given only by server functions
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);
select throws_ok(
  $$ insert into public.table_members (table_id, user_id)
     values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b') $$,
  '42501',
  null,
  'nobody takes a seat directly'
);

select * from finish();

rollback;
