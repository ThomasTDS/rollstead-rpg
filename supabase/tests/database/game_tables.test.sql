-- NT-08 and NT-11: only members see a table, and only its master changes it.

begin;

select plan(25);

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'ana@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'bia@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'caio@example.com');

insert into public.profiles (id, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'Ana'),
  ('00000000-0000-0000-0000-00000000000b', 'Bia'),
  ('00000000-0000-0000-0000-00000000000c', 'Caio');

insert into public.game_tables (id, name, master_id)
values ('10000000-0000-0000-0000-000000000001', 'Mesa da Ana', '00000000-0000-0000-0000-00000000000a');

insert into public.table_members (table_id, user_id)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b');

select has_table('public', 'game_tables', 'game_tables exists');
select has_table('public', 'table_members', 'table_members exists');

-- Anonymous visitors
set local role anon;

select throws_ok($$ select * from public.game_tables $$, '42501', null, 'anon cannot read tables');
select throws_ok($$ select * from public.table_members $$, '42501', null, 'anon cannot read members');
select throws_ok($$ select public.create_table('Anon') $$, '42501', null, 'anon cannot create a table');

-- Caio: signed in, but outside the table
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c"}', true);

select is_empty($$ select 1 from public.game_tables $$, 'an outsider reads no table');
select is_empty($$ select 1 from public.table_members $$, 'an outsider reads no member');
select is_empty(
  $$ select 1 from public.profiles where id <> '00000000-0000-0000-0000-00000000000c' $$,
  'an outsider reads no name of the people at the table'
);
select lives_ok(
  $$ update public.game_tables set name = 'Hacked by Caio' $$,
  'an outsider update runs but reaches no row'
);
select throws_ok(
  $$ insert into public.table_members (table_id, user_id)
     values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c') $$,
  '42501',
  null,
  'an outsider cannot take a seat'
);
select throws_ok(
  $$ insert into public.game_tables (name, master_id)
     values ('Sem mestre', '00000000-0000-0000-0000-00000000000c') $$,
  '42501',
  null,
  'nobody creates a table without going through create_table'
);
select lives_ok($$ delete from public.game_tables $$, 'an outsider delete runs but reaches no row');

-- Bia: player at the table
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);

select results_eq(
  $$ select name from public.game_tables $$,
  $$ values ('Mesa da Ana') $$,
  'a player reads the table'
);
select results_eq(
  $$ select count(*) from public.table_members $$,
  $$ values (1::bigint) $$,
  'a player reads only their own seat'
);
select results_eq(
  $$ select display_name from public.list_my_tables() t,
       jsonb_to_recordset(t.participants) as p(display_name text)
     order by display_name $$,
  $$ values ('Ana'), ('Bia') $$,
  'a player reads the names at the table, and nobody else'
);
select lives_ok(
  $$ update public.game_tables set name = 'Hacked by Bia' $$,
  'a player update runs but reaches no row'
);

-- Ana: master of the table
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select lives_ok($$ update public.game_tables set name = 'Nova mesa' $$, 'the master renames the table');
select throws_ok($$ update public.game_tables set name = '' $$, '23514', null, 'an empty name is rejected');
select throws_ok(
  $$ update public.game_tables set name = repeat('a', 61) $$,
  '23514',
  null,
  'a 61-character name is rejected'
);
select throws_ok($$ update public.table_members set joined_at = now() $$, '42501', null, 'not even the master edits a seat directly');
select lives_ok($$ select public.create_table('Segunda mesa') $$, 'a user creates a table');
select results_eq(
  $$ select role from public.list_my_tables() where name = 'Segunda mesa' $$,
  $$ values ('master') $$,
  'whoever creates a table becomes its master, with a seat at it'
);
select throws_ok($$ select public.create_table('') $$, '23514', null, 'create_table rejects an empty name');
select throws_ok(
  $$ select public.create_table(repeat('a', 61)) $$,
  '23514',
  null,
  'create_table rejects a 61-character name'
);

-- Back to the superuser
reset role;

select results_eq(
  $$ select name from public.game_tables where id = '10000000-0000-0000-0000-000000000001' $$,
  $$ values ('Nova mesa') $$,
  'only the master changed the name'
);

select * from finish();

rollback;
