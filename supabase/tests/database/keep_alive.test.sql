-- public.keep_alive(): writes at most once an hour and touches nothing else.

begin;

select plan(5);

update public.health_check set updated_at = now() - interval '2 hours' where id = 1;

set local role anon;

select is(
  public.keep_alive(),
  now(),
  'anon can call keep_alive, which refreshes an old timestamp'
);

reset role;
update public.health_check set updated_at = now() - interval '10 minutes' where id = 1;
set local role anon;

select is(
  public.keep_alive(),
  now() - interval '10 minutes',
  'keep_alive does not write again within the hour'
);

select results_eq(
  'select status from public.health_check',
  $$ values ('ok') $$,
  'keep_alive leaves the status untouched'
);

select throws_ok(
  $$ update public.health_check set updated_at = now() $$,
  '42501',
  null,
  'anon still cannot update the row directly'
);

reset role;
set local role authenticated;

select throws_ok(
  'select public.keep_alive()',
  '42501',
  null,
  'signed-in users cannot call keep_alive'
);

select * from finish();

rollback;
