-- Permite que usuarios autenticados usen las tablas de Accountability Partner.
-- La seguridad de cada registro permanece controlada por las políticas RLS
-- definidas en schema.sql.

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.coach_relationships to authenticated;
grant select, insert, update, delete on table public.items to authenticated;
grant select, insert, update, delete on table public.item_permissions to authenticated;
grant select, insert on table public.activity_log to authenticated;
