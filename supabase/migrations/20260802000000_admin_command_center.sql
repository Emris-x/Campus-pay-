-- Admin command center schema extension for CampusPay.
-- Apply this migration in Supabase SQL editor or via the CLI.
-- This version keeps the existing student-facing policies intact and
-- restricts admin-only operations to trusted, least-privilege paths.

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','admin','finance_admin','support_admin')),
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null default 'announcement',
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.wallet_ledgers (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.transactions(id) on delete set null,
  entry_type text not null check (entry_type in ('credit','debit','adjustment')),
  amount numeric(12, 2) not null,
  currency text not null default 'NGN',
  balance_after numeric(12, 2),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists admin_profiles_role_idx on public.admin_profiles (role);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists notifications_status_idx on public.notifications (status);
create index if not exists wallet_ledgers_created_at_idx on public.wallet_ledgers (created_at desc);

create or replace function public.is_authorized_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.status = 'active'
      and ap.role in ('super_admin','admin','finance_admin','support_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.status = 'active'
      and ap.role = 'super_admin'
  );
$$;

create or replace function public.is_privileged_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_profiles ap
    where ap.id = auth.uid()
      and ap.status = 'active'
      and ap.role in ('super_admin','admin','finance_admin')
  );
$$;

revoke all on function public.is_authorized_admin() from public;
revoke all on function public.is_super_admin() from public;
revoke all on function public.is_privileged_admin() from public;

grant execute on function public.is_authorized_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_privileged_admin() to authenticated;

alter table public.admin_profiles enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.system_settings enable row level security;
alter table public.wallet_ledgers enable row level security;

create policy "Users can read their own admin profile"
  on public.admin_profiles for select to authenticated
  using (auth.uid() = id);

create policy "Authorized admins can read admin profiles"
  on public.admin_profiles for select to authenticated
  using (public.is_authorized_admin());

create policy "Super admins can insert admin profiles"
  on public.admin_profiles for insert to authenticated
  with check (public.is_super_admin());

create policy "Super admins can update admin profiles"
  on public.admin_profiles for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Authorized admins can view audit logs"
  on public.audit_logs for select to authenticated
  using (public.is_authorized_admin());

create policy "Admins can append their own audit logs"
  on public.audit_logs for insert to authenticated
  with check (public.is_authorized_admin() and actor_id = auth.uid());

create policy "Authorized admins can read notifications"
  on public.notifications for select to authenticated
  using (public.is_authorized_admin());

create policy "Super admins can insert notifications"
  on public.notifications for insert to authenticated
  with check (public.is_super_admin());

create policy "Super admins can update notifications"
  on public.notifications for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Super admins can delete notifications"
  on public.notifications for delete to authenticated
  using (public.is_super_admin());

create policy "Authorized admins can read settings"
  on public.system_settings for select to authenticated
  using (public.is_authorized_admin());

create policy "Super admins can insert settings"
  on public.system_settings for insert to authenticated
  with check (public.is_super_admin());

create policy "Super admins can update settings"
  on public.system_settings for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Super admins can delete settings"
  on public.system_settings for delete to authenticated
  using (public.is_super_admin());

create policy "Authorized admins can read wallet ledgers"
  on public.wallet_ledgers for select to authenticated
  using (public.is_authorized_admin());

create policy "Authorized admins can view all students"
  on public.students for select to authenticated
  using (public.is_authorized_admin());

create policy "Authorized admins can view all transactions"
  on public.transactions for select to authenticated
  using (public.is_authorized_admin());

create policy "Privileged admins can update transactions"
  on public.transactions for update to authenticated
  using (public.is_privileged_admin())
  with check (public.is_privileged_admin());
