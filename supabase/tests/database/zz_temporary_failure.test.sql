-- TEMPORARY: proves that a failing test blocks the merge (NT-03). Will be reverted.
begin;
select plan(1);
select ok(false, 'this test fails on purpose');
select * from finish();
rollback;
