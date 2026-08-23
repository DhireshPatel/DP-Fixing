-- =====================================================================
-- DP Fixing — Supabase (PostgreSQL) schema
-- Run this entire file in your Supabase project's SQL Editor once,
-- before running `npm run seed`.
-- =====================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  short_description text not null,
  image text not null,
  price numeric not null check (price >= 0),
  duration text not null,
  category text default 'General',
  included text[] default '{}',
  notes text[] default '{}',
  active boolean default true,
  popular boolean default false,
  "order" integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_services_active on services (active);
create index if not exists idx_services_popular on services (popular);

-- ---------------------------------------------------------------------
-- SERVICE MEN
-- ---------------------------------------------------------------------
create table if not exists service_men (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text default '',
  city text default '',
  state text default '',
  pincode text default '',
  latitude double precision not null,
  longitude double precision not null,
  services uuid[] default '{}',           -- array of services.id
  working_days text[] default '{Mon,Tue,Wed,Thu,Fri,Sat}',
  working_hours jsonb default '{"start": "09:00", "end": "19:00"}',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_service_men_active on service_men (active);

-- ---------------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id text not null unique,          -- human-friendly ID e.g. DP-102493

  customer_name text not null,
  phone text not null,

  address text not null,
  city text default '',
  state text default '',
  pincode text default '',

  latitude double precision not null,
  longitude double precision not null,
  location_accuracy double precision,
  location_source text not null check (location_source in ('gps', 'manual')),

  -- services is a JSON array of:
  -- { serviceId, serviceName, price, quantity, subtotal }
  services jsonb not null,

  subtotal numeric not null,
  visiting_fee numeric not null,
  total_amount numeric not null,

  preferred_date text not null,
  preferred_time_slot text not null,
  timezone text default 'Asia/Kolkata',

  notes text default '',

  status text not null default 'Pending' check (
    status in ('Pending', 'Confirmed', 'Assigned', 'In Progress', 'Completed', 'Cancelled')
  ),

  assigned_service_man uuid references service_men(id) on delete set null,
  assigned_service_man_name text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_bookings_status on bookings (status);
create index if not exists idx_bookings_created_at on bookings (created_at desc);

-- ---------------------------------------------------------------------
-- ADMINS
-- ---------------------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text default 'Admin',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- SETTINGS (singleton row)
-- ---------------------------------------------------------------------
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'main',
  visiting_fee numeric default 100,
  -- service_areas: [{ name, latitude, longitude, radiusKm }]
  service_areas jsonb default '[]',
  working_hours jsonb default '{"start": "08:00", "end": "20:00"}',
  time_slots text[] default '{"8:00 AM - 10:00 AM","10:00 AM - 12:00 PM","12:00 PM - 2:00 PM","2:00 PM - 4:00 PM","4:00 PM - 6:00 PM","6:00 PM - 8:00 PM"}',
  business_phone text default '',
  telegram_enabled boolean default true,
  service_available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- updated_at auto-touch trigger
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_services_updated_at on services;
create trigger trg_services_updated_at before update on services
  for each row execute function set_updated_at();

drop trigger if exists trg_service_men_updated_at on service_men;
create trigger trg_service_men_updated_at before update on service_men
  for each row execute function set_updated_at();

drop trigger if exists trg_bookings_updated_at on bookings;
create trigger trg_bookings_updated_at before update on bookings
  for each row execute function set_updated_at();

drop trigger if exists trg_settings_updated_at on settings;
create trigger trg_settings_updated_at before update on settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- All access from this app goes through Next.js API routes using the
-- Supabase SERVICE ROLE key (server-side only), which bypasses RLS.
-- We still enable RLS and add safe read-only policies for the public
-- anon key, in case it is ever used directly, but all writes must
-- go through the server (service role).
-- ---------------------------------------------------------------------
alter table services enable row level security;
alter table service_men enable row level security;
alter table bookings enable row level security;
alter table admins enable row level security;
alter table settings enable row level security;

drop policy if exists "Public can read active services" on services;
create policy "Public can read active services"
  on services for select
  using (active = true);

-- No public policies on service_men, bookings, admins, or settings —
-- these are only ever accessed via the server-side service role key.

-- ---------------------------------------------------------------------
-- Seed default settings row (safe to run multiple times)
-- ---------------------------------------------------------------------
insert into settings (singleton_key)
values ('main')
on conflict (singleton_key) do nothing;
