-- Access rules for public.health_check.

begin;

select plan(5);

set local role anon;

select results_eq(
  'select status from public.health_check',
  $$ values ('ok') $$,
  'anon can read the health check row'
);

select throws_ok(
  $$ insert into public.health_check (id, status) values (2, 'fake') $$,
  '42501',
  null,
  'anon cannot insert rows'
);

select throws_ok(
  $$ update public.health_check set status = 'down' $$,
  '42501',
  null,
  'anon cannot update rows'
);

select throws_ok(
  $$ delete from public.health_check $$,
  '42501',
  null,
  'anon cannot delete rows'
);

reset role;
set local role authenticated;

select throws_ok(
  $$ update public.health_check set status = 'down' $$,
  '42501',
  null,
  'authenticated users cannot update rows'
);

select * from finish();

rollback;
