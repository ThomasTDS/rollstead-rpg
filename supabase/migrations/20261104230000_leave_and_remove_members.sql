-- NT-74: the master removes players and a player leaves on their own. Seats still only
-- arrive through server functions; leaving one is the single direct write allowed.
--
-- The master is not excluded here on purpose: game_tables_master_seat already refuses
-- the deletion of their seat while the table exists, with an error instead of silence.

grant delete on table public.table_members to authenticated;

create policy "Masters remove players and players leave"
  on public.table_members
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_table_master(table_id)
  );
