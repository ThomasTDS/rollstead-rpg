-- Test scenario for the local database and for staging, applied after the migrations on
-- every reset. Production never receives this file (see the migrate job in ci.yml), and
-- that is what keeps these accounts out of it: they cannot log in where they do not exist.
--
-- auth.users survives a staging reset, hence the "on conflict do nothing". One transaction,
-- because game_tables_master_seat is only checked at commit.

begin;

create temporary table test_people (id uuid, name text, email text, position integer) on commit drop;

insert into test_people (id, name, email, position)
values
  ('feed0000-0000-4000-a000-000000000001', 'Ana', 'ana@teste.rollstead.com.br', 1),
  ('feed0000-0000-4000-a000-000000000002', 'Bia', 'bia@teste.rollstead.com.br', 2),
  ('feed0000-0000-4000-a000-000000000003', 'Caio', 'caio@teste.rollstead.com.br', 3),
  ('feed0000-0000-4000-a000-000000000004', 'Duda', 'duda@teste.rollstead.com.br', 4),
  ('feed0000-0000-4000-a000-000000000005', 'Edu', 'edu@teste.rollstead.com.br', 5),
  ('feed0000-0000-4000-a000-000000000006', 'Fabi', 'fabi@teste.rollstead.com.br', 6),
  ('feed0000-0000-4000-a000-000000000007', 'Gui', 'gui@teste.rollstead.com.br', 7);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
select
  id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  email,
  extensions.crypt('rollstead-teste', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '', '', '', ''
from test_people
on conflict (id) do nothing;

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  id::text,
  id,
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
  'email',
  now(),
  now(),
  now()
from test_people
on conflict do nothing;

insert into public.profiles (id, display_name)
select id, name from test_people;

insert into public.game_tables (id, name, master_id)
values
  ('feed0000-0000-4000-b000-000000000001', 'A Mina Perdida', 'feed0000-0000-4000-a000-000000000001'),
  ('feed0000-0000-4000-b000-000000000002', 'Mesa cheia', 'feed0000-0000-4000-a000-000000000001');

insert into public.table_members (table_id, user_id, joined_at)
select 'feed0000-0000-4000-b000-000000000001', id, now() + make_interval(secs => position)
from test_people
where position <= 3;

insert into public.table_members (table_id, user_id, joined_at)
select 'feed0000-0000-4000-b000-000000000002', id, now() + make_interval(secs => position)
from test_people;

commit;
