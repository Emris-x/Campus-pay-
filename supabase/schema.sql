-- ==========================================================================
-- CampusPay — Supabase schema
-- Run this in the Supabase SQL editor for a fresh project.
-- Auth (email + password) is handled by Supabase's built-in auth.users;
-- this schema stores the CampusPay-specific profile & transaction data.
-- ==========================================================================

-- Student profile, linked 1:1 to an auth.users row.
create table if not exists public.students (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  matric_number text not null unique,
  registration_number text not null,
  faculty text,
  created_at timestamptz not null default now()
);

-- Known faculty bank accounts. Populate this once you have the list
-- from the bursary — it powers the "did I type the right account
-- number?" dropdown on the payment form.
create table if not exists public.faculties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  account_number text not null,
  bank_name text,
  created_at timestamptz not null default now()
);

-- One row per fee payment a student initiates.
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  matric_number text not null,
  registration_number text not null,
  fee_type text not null check (fee_type in ('school_fee', 'admission_fee', 'course_registration')),
  faculty_name text,
  faculty_account_number text,
  amount numeric(12, 2) not null check (amount > 0),
  receipt_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'verified', 'failed')),
  payment_reference text, -- filled in once a bank/payment-gateway API is wired up
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists transactions_student_id_idx on public.transactions (student_id);
create index if not exists transactions_matric_idx on public.transactions (matric_number);

-- ---------------------------------------------------------------------
-- Row Level Security: students only ever see their own rows.
-- Admin access should go through a service-role key on a trusted
-- server (e.g. a Supabase Edge Function), never the anon key.
-- ---------------------------------------------------------------------
alter table public.students enable row level security;
alter table public.transactions enable row level security;

create policy "Students can view their own profile"
  on public.students for select
  using (auth.uid() = id);

create policy "Students can update their own profile"
  on public.students for update
  using (auth.uid() = id);

create policy "Students can insert their own profile on signup"
  on public.students for insert
  with check (auth.uid() = id);

create policy "Students can view their own transactions"
  on public.transactions for select
  using (auth.uid() = student_id);

create policy "Students can create their own transactions"
  on public.transactions for insert
  with check (auth.uid() = student_id);

-- Faculties table is readable by any signed-in student (needed for the
-- account-number dropdown), writable only via the Supabase dashboard
-- or a service-role key for now.
alter table public.faculties enable row level security;

create policy "Signed-in users can read faculties"
  on public.faculties for select
  using (auth.role() = 'authenticated');
