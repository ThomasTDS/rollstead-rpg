-- Real database write for the keep-alive workflow (NT-54, DEC-017).
-- Daily reads were not enough: Supabase still warned that the free projects would be
-- paused for low activity. This function touches the single health_check row, so each
-- ping also writes. It writes at most once an hour, so calling it in a loop with the
-- public key only produces reads.

create function public.keep_alive()
returns timestamptz
language sql
volatile
security definer
set search_path = ''
as $$
  update public.health_check
     set updated_at = now()
   where id = 1
     and updated_at < now() - interval '1 hour';

  select updated_at from public.health_check where id = 1;
$$;

comment on function public.keep_alive() is 'Keep-alive ping: refreshes health_check.updated_at at most once an hour and returns it.';

revoke all on function public.keep_alive() from public, anon, authenticated;
grant execute on function public.keep_alive() to anon;
