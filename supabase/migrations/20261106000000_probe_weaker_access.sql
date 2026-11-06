-- Deliberate violation for the Sprint 1 review. This pull request is closed without merge.
create policy "Probe: everyone reads every seat"
  on public.table_members for select to authenticated using (true);
grant select (master_id) on table public.game_tables to authenticated;
grant update (list_position) on table public.table_members to authenticated;
create policy "Probe: everyone edits every seat"
  on public.table_members for update to authenticated using (true);
drop policy "Masters remove players and players leave" on public.table_members;
create policy "Probe: everyone removes anyone"
  on public.table_members for delete to authenticated using (true);
