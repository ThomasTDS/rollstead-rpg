-- Lightweight table read by external checks (e.g. the keep-alive workflow from NT-54).
-- Anyone with the public key can read it; nobody can change it through the API.

create table public.health_check (
  id smallint primary key default 1 check (id = 1),
  status text not null default 'ok',
  updated_at timestamptz not null default now()
);

comment on table public.health_check is 'Single-row table used by external health and keep-alive checks.';

alter table public.health_check enable row level security;

revoke all on table public.health_check from anon, authenticated;
grant select on table public.health_check to anon, authenticated;

create policy "Health check is readable by everyone"
  on public.health_check
  for select
  to anon, authenticated
  using (true);

insert into public.health_check (id) values (1);
