-- Accountability Partner: equipo y estructura.
-- Ejecutar una sola vez en Supabase > SQL Editor.

create table if not exists public.organization_settings (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  data jsonb not null default '{"positions":[],"people":[],"placements":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.organization_settings enable row level security;
grant select, insert, update, delete on table public.organization_settings to authenticated;

drop policy if exists "organization: owner manages" on public.organization_settings;
create policy "organization: owner manages" on public.organization_settings
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create or replace function public.touch_organization_settings()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists organization_settings_updated_at on public.organization_settings;
create trigger organization_settings_updated_at before update on public.organization_settings
for each row execute procedure public.touch_organization_settings();
