-- NT-75: one source of truth for the master, unique names per master, rename and delete.

begin;

select plan(21);

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
values ('10000000-0000-0000-0000-000000000001', 'DnD', '00000000-0000-0000-0000-00000000000a');

insert into public.table_members (table_id, user_id)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b');

insert into public.table_invites (table_id, token_hash, expires_at)
values ('10000000-0000-0000-0000-000000000001', 'hash', now() + interval '7 days');

-- Single source of truth
select hasnt_column('public', 'table_members', 'role', 'the role is not stored: it comes from master_id');
select col_not_null('public', 'game_tables', 'master_id', 'every table has a master');

select throws_ok(
  $$ set constraints public.game_tables_master_seat immediate;
     update public.game_tables
     set master_id = '00000000-0000-0000-0000-00000000000c'
     where id = '10000000-0000-0000-0000-000000000001' $$,
  '23503',
  null,
  'master_id cannot point to someone without a seat at the table'
);
select throws_ok(
  $$ set constraints public.game_tables_master_seat immediate;
     delete from public.table_members
     where table_id = '10000000-0000-0000-0000-000000000001'
       and user_id = '00000000-0000-0000-0000-00000000000a' $$,
  '23503',
  null,
  'the master cannot lose their seat while the table exists'
);

-- Ana: master
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select throws_ok(
  $$ update public.game_tables set master_id = '00000000-0000-0000-0000-00000000000b' $$,
  '42501',
  null,
  'not even the master rewrites master_id through the API'
);
select throws_ok($$ select public.create_table('DnD') $$, '23505', null, 'the same name is refused');
select throws_ok($$ select public.create_table('dnd') $$, '23505', null, 'case does not make a name different');
select throws_ok($$ select public.create_table('dnd  ') $$, '23505', null, 'surrounding spaces do not make a name different');
select lives_ok($$ select public.create_table('Outra') $$, 'a different name is accepted');
select throws_ok(
  $$ update public.game_tables set name = 'DND' where name = 'Outra' $$,
  '23505',
  null,
  'renaming to a name already in use is refused'
);
select lives_ok(
  $$ update public.game_tables set name = 'DND' where name = 'DnD' $$,
  'a table can change the case of its own name'
);

-- Bia: player, and master of her own tables
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);

select lives_ok($$ select public.create_table('dnd') $$, 'another master can use the same name');
select lives_ok(
  $$ delete from public.game_tables where id = '10000000-0000-0000-0000-000000000001' $$,
  'a player delete runs but reaches no row'
);
select lives_ok(
  $$ update public.game_tables set name = 'Hacked' where id = '10000000-0000-0000-0000-000000000001' $$,
  'a player rename runs but reaches no row'
);
select throws_ok(
  $$ update public.game_tables set master_id = '00000000-0000-0000-0000-00000000000b' $$,
  '42501',
  null,
  'a player cannot make themselves the master'
);

-- Back to Ana: delete is definitive and frees the name
reset role;
select results_eq(
  $$ select name from public.game_tables where id = '10000000-0000-0000-0000-000000000001' $$,
  $$ values ('DND') $$,
  'nothing the player tried changed the table'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select lives_ok(
  $$ delete from public.game_tables where id = '10000000-0000-0000-0000-000000000001' $$,
  'the master deletes the table'
);
select lives_ok($$ select public.create_table('dnd') $$, 'the name of a deleted table is free again');

reset role;
select is_empty(
  $$ select 1 from public.game_tables where id = '10000000-0000-0000-0000-000000000001' $$,
  'the table is gone'
);
select is_empty(
  $$ select 1 from public.table_members where table_id = '10000000-0000-0000-0000-000000000001' $$,
  'the seats went with it'
);
select is_empty(
  $$ select 1 from public.table_invites where table_id = '10000000-0000-0000-0000-000000000001' $$,
  'the invite went with it'
);

select * from finish();

rollback;
