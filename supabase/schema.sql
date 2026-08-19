-- Mi Carril: esquema inicial para sincronización, coach y permisos.
-- Ejecutar completo en Supabase > SQL Editor. Es seguro para una base nueva.

create extension if not exists pgcrypto;

create type public.item_visibility as enum ('personal', 'shared', 'coach_assigned');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);

create table public.coach_relationships (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  primary key (owner_id, coach_id),
  check (owner_id <> coach_id)
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  assigned_to uuid references public.profiles(id) on delete set null,
  visibility public.item_visibility not null default 'personal',
  title text not null check (char_length(title) between 1 and 500),
  status text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_owner_idx on public.items(owner_id, updated_at desc);
create index items_assigned_idx on public.items(assigned_to, updated_at desc);
create index items_creator_idx on public.items(created_by, updated_at desc);

create table public.item_permissions (
  item_id uuid not null references public.items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  can_view boolean not null default true,
  can_view_progress boolean not null default true,
  can_comment boolean not null default false,
  can_update boolean not null default false,
  can_edit boolean not null default false,
  can_assign boolean not null default false,
  granted_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (item_id, user_id)
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete restrict,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_item_idx on public.activity_log(item_id, created_at desc);

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_user();

create or replace function public.touch_item()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger item_updated_at before update on public.items
for each row execute procedure public.touch_item();

alter table public.profiles enable row level security;
alter table public.coach_relationships enable row level security;
alter table public.items enable row level security;
alter table public.item_permissions enable row level security;
alter table public.activity_log enable row level security;

create policy "profiles: own profile" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "profiles: update own" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "coaches: owner manages" on public.coach_relationships
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "coaches: coach sees relationship" on public.coach_relationships
for select to authenticated using (coach_id = auth.uid());

create policy "items: visible only when allowed" on public.items
for select to authenticated using (
  owner_id = auth.uid() or created_by = auth.uid() or assigned_to = auth.uid() or
  exists (select 1 from public.item_permissions p where p.item_id = id and p.user_id = auth.uid() and p.can_view)
);
create policy "items: owner or active coach creates" on public.items
for insert to authenticated with check (
  created_by = auth.uid() and (
    owner_id = auth.uid() or exists (
      select 1 from public.coach_relationships c
      where c.owner_id = owner_id and c.coach_id = auth.uid() and c.status = 'active'
    )
  )
);
create policy "items: allowed updates" on public.items
for update to authenticated using (
  owner_id = auth.uid() or created_by = auth.uid() or assigned_to = auth.uid() or
  exists (select 1 from public.item_permissions p where p.item_id = id and p.user_id = auth.uid() and p.can_update)
)
with check (
  owner_id = auth.uid() or created_by = auth.uid() or assigned_to = auth.uid() or
  exists (select 1 from public.item_permissions p where p.item_id = id and p.user_id = auth.uid() and p.can_update)
);
-- Solo quien creó un pendiente puede borrarlo físicamente. Lo normal será cancelarlo.
create policy "items: only creator deletes" on public.items
for delete to authenticated using (created_by = auth.uid());

create policy "permissions: owner administers" on public.item_permissions
for all to authenticated using (
  exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid())
)
with check (
  exists (select 1 from public.items i where i.id = item_id and i.owner_id = auth.uid()) and granted_by = auth.uid()
);
create policy "permissions: recipient sees own" on public.item_permissions
for select to authenticated using (user_id = auth.uid());

create policy "activity: authorized viewers" on public.activity_log
for select to authenticated using (
  exists (select 1 from public.items i where i.id = item_id and (
    i.owner_id = auth.uid() or i.created_by = auth.uid() or i.assigned_to = auth.uid() or
    exists (select 1 from public.item_permissions p where p.item_id = i.id and p.user_id = auth.uid() and p.can_view_progress)
  ))
);
create policy "activity: authorized actor adds" on public.activity_log
for insert to authenticated with check (
  actor_id = auth.uid() and exists (select 1 from public.items i where i.id = item_id and (
    i.owner_id = auth.uid() or i.created_by = auth.uid() or i.assigned_to = auth.uid() or
    exists (select 1 from public.item_permissions p where p.item_id = i.id and p.user_id = auth.uid() and p.can_update)
  ))
);
