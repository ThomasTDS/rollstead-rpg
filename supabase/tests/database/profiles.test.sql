-- NT-73: each user owns their display name, and only they can write it.

begin;

select plan(13);

insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-00000000000a', 'ana@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'bia@example.com');

insert into public.profiles (id, display_name)
values ('00000000-0000-0000-0000-00000000000b', 'Bia');

select has_table('public', 'profiles', 'profiles table exists');
select hasnt_column('public', 'profiles', 'email', 'profiles never stores the email');

-- Anonymous visitors
set local role anon;

select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  null,
  'anon cannot read profiles'
);

-- Signed in as Ana
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', true);

select is_empty(
  $$ select 1 from public.profiles where id = '00000000-0000-0000-0000-00000000000b' $$,
  'a user does not read the profile of someone outside their tables'
);

select lives_ok(
  $$ insert into public.profiles (id, display_name)
     values ('00000000-0000-0000-0000-00000000000a', 'Ana') $$,
  'a user creates their own profile'
);

select results_eq(
  $$ select display_name from public.profiles $$,
  $$ values ('Ana') $$,
  'a user reads their own profile'
);

select lives_ok(
  $$ update public.profiles set display_name = 'Ana Clara' $$,
  'a user renames their own profile'
);

select throws_ok(
  $$ insert into public.profiles (id, display_name)
     values ('00000000-0000-0000-0000-00000000000b', 'Fake') $$,
  '42501',
  null,
  'a user cannot create a profile for someone else'
);

select throws_ok(
  $$ update public.profiles set created_at = now() $$,
  '42501',
  null,
  'a user cannot rewrite created_at'
);

select throws_ok(
  $$ update public.profiles set display_name = '' $$,
  '23514',
  null,
  'an empty name is rejected'
);

select throws_ok(
  $$ update public.profiles set display_name = repeat('a', 41) $$,
  '23514',
  null,
  'a 41-character name is rejected'
);

select throws_ok(
  $$ update public.profiles set display_name = '  Ana  ' $$,
  '23514',
  null,
  'a name with surrounding spaces is rejected'
);

-- Back to the superuser: Bia's row must be untouched by every attempt above
reset role;

select results_eq(
  $$ select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000b' $$,
  $$ values ('Bia') $$,
  'nothing Ana tried changed the profile of Bia'
);

select * from finish();

rollback;
