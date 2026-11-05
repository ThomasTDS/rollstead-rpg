-- NT-77: each user orders their own list, and new tables reach the top.

begin;

select plan(9);

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'ana@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'bia@example.com');

insert into public.profiles (id, display_name)
values
  ('00000000-0000-0000-0000-00000000000a', 'Ana'),
  ('00000000-0000-0000-0000-00000000000b', 'Bia');

insert into public.game_tables (id, name, master_id)
values
  ('10000000-0000-0000-0000-000000000001', 'Primeira', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000002', 'Segunda', '00000000-0000-0000-0000-00000000000a'),
  ('10000000-0000-0000-0000-000000000003', 'Terceira', '00000000-0000-0000-0000-00000000000a');

insert into public.table_members (table_id, user_id, joined_at)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', '2026-01-01'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', '2026-01-02'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000a', '2026-01-03'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', '2026-01-04'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b', '2026-01-05');

select has_function_privilege('anon', 'public.reorder_my_tables(uuid[])', 'execute') = false
  as anon_denied into temporary test_anon;
select ok((select anon_denied from test_anon), 'anon cannot reorder');

-- Ana
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select results_eq(
  $$ select name from public.list_my_tables() $$,
  $$ values ('Terceira'), ('Segunda'), ('Primeira') $$,
  'without an order, the newest seat comes first'
);
select lives_ok(
  $$ select public.reorder_my_tables(array[
       '10000000-0000-0000-0000-000000000001',
       '10000000-0000-0000-0000-000000000003',
       '10000000-0000-0000-0000-000000000002'
     ]::uuid[]) $$,
  'a user saves an order'
);
select results_eq(
  $$ select name from public.list_my_tables() $$,
  $$ values ('Primeira'), ('Terceira'), ('Segunda') $$,
  'the list follows the saved order'
);
select lives_ok($$ select public.create_table('Nova') $$, 'a user creates a table');
select results_eq(
  $$ select name from public.list_my_tables() limit 1 $$,
  $$ values ('Nova') $$,
  'a new table reaches the top of an ordered list'
);
select throws_ok(
  $$ update public.table_members set list_position = 1 $$,
  '42501',
  null,
  'the order is not written directly'
);

-- Bia: same tables, another list
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', true);

select results_eq(
  $$ select name from public.list_my_tables() $$,
  $$ values ('Segunda'), ('Primeira') $$,
  'reordering changes nobody else''s list'
);

select public.reorder_my_tables(array[
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001'
]::uuid[]);

reset role;
select results_eq(
  $$ select list_position
     from public.table_members
     where user_id = '00000000-0000-0000-0000-00000000000a'
       and table_id = '10000000-0000-0000-0000-000000000001' $$,
  $$ values (1) $$,
  'an order saved by someone else does not reach the seats of the master'
);

select * from finish();

rollback;
