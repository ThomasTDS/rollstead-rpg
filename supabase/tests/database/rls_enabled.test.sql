-- Every table in the public schema must have row level security enabled.
-- A table without RLS is fully exposed to anyone holding the public API key.

begin;

select plan(1);

select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and not c.relrowsecurity
  $$,
  'every table in the public schema has RLS enabled'
);

select * from finish();

rollback;
