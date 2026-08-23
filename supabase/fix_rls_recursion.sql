-- Corrige la recursión entre items e item_permissions.
-- Ejecutar una vez en Supabase > SQL Editor.

create or replace function public.is_item_owner(target_item_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.items
    where id = target_item_id and owner_id = target_user_id
  );
$$;

revoke all on function public.is_item_owner(uuid, uuid) from public;
grant execute on function public.is_item_owner(uuid, uuid) to authenticated;

drop policy if exists "permissions: owner administers" on public.item_permissions;

create policy "permissions: owner administers" on public.item_permissions
for all to authenticated
using (public.is_item_owner(item_id, auth.uid()))
with check (public.is_item_owner(item_id, auth.uid()) and granted_by = auth.uid());
