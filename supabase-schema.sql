-- Run this script once in the Supabase SQL Editor for the CyberFixCR project.
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  service text not null check (char_length(btrim(service)) between 2 and 120),
  message text not null check (char_length(btrim(message)) between 5 and 1200),
  status text not null default 'received'
    check (status in ('received', 'reviewing', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.service_requests enable row level security;

revoke all on table public.service_requests from anon;
revoke all on table public.service_requests from authenticated;
grant select, insert on table public.service_requests to authenticated;

drop policy if exists "Customers can read their own requests" on public.service_requests;
create policy "Customers can read their own requests"
  on public.service_requests
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can create their own requests" on public.service_requests;
create policy "Customers can create their own requests"
  on public.service_requests
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'received'
  );
