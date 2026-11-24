-- 005_informator_messages.sql
-- Wiadomości z formularza Informator

create table if not exists public.informator_messages (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  message text not null,
  contact text,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.informator_messages enable row level security;

-- Każdy (anon i zalogowany) może wysłać zgłoszenie
create policy "informator_messages_insert_anon"
  on public.informator_messages
  for insert
  to anon
  with check (true);

create policy "informator_messages_insert_authenticated"
  on public.informator_messages
  for insert
  to authenticated
  with check (true);

-- Tylko admin może odczytywać zgłoszenia
create policy "informator_messages_select_admin"
  on public.informator_messages
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Tylko admin może aktualizować status
create policy "informator_messages_update_admin"
  on public.informator_messages
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create index if not exists informator_messages_created_at_idx on public.informator_messages (created_at desc);
create index if not exists informator_messages_status_idx on public.informator_messages (status);
