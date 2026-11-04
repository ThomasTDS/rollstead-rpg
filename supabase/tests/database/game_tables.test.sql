-- NT-08 and NT-11: only members see a table, and only its master changes it.

begin;

select plan(27);

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

insert into public.game_tables (id, name)
values ('10000000-0000-0000-0000-000000000001', 'Mesa da Ana');

insert into public.table_members (table_id, user_id, role)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'master'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'player');

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
  $$ insert into public.table_members (table_id, user_id, role)
     values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'player') $$,
  '42501',
  null,
  'an outsider cannot take a seat'
);
select throws_ok(
  $$ insert into public.game_tables (name) values ('Sem mestre') $$,
  '42501',
  null,
  'nobody creates a table without going through create_table'
);
select throws_ok($$ delete from public.game_tables $$, '42501', null, 'an outsider cannot delete tables');

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
  $$ values (2::bigint) $$,
  'a player reads who sits at the table'
);
select results_eq(
  $$ select display_name from public.profiles order by display_name $$,
  $$ values ('Ana'), ('Bia') $$,
  'a player reads the names at the table, and nobody else'
);
select lives_ok(
  $$ update public.game_tables set name = 'Hacked by Bia' $$,
  'a player update runs but reaches no row'
);
select throws_ok(
  $$ update public.table_members set role = 'master' $$,
  '42501',
  null,
  'a player cannot promote themselves'
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
select throws_ok($$ delete from public.table_members $$, '42501', null, 'not even the master deletes members directly');
select lives_ok($$ select public.create_table('Segunda mesa') $$, 'a user creates a table');
select results_eq(
  $$ select m.role::text
     from public.table_members m
     join public.game_tables t on t.id = m.table_id
     where t.name = 'Segunda mesa' $$,
  $$ values ('master') $$,
  'whoever creates a table becomes its master'
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

select throws_ok(
  $$ insert into public.table_members (table_id, user_id, role)
     values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000c', 'master') $$,
  '23505',
  null,
  'a table has a single master'
);
select results_eq(
  $$ select name from public.game_tables where id = '10000000-0000-0000-0000-000000000001' $$,
  $$ values ('Nova mesa') $$,
  'only the master changed the name'
);

select * from finish();

rollback;
