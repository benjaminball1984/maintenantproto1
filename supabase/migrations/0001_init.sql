-- =====================================================================
-- Pas de pesticides pour nos enfants — Migration initiale (Phase 1+)
-- À exécuter dans le SQL Editor Supabase, ou via supabase CLI.
-- =====================================================================

-- ---------- Signatures ----------
create table if not exists signatures (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  postal_code text not null,
  phone text,
  consent_campaign boolean not null default false,
  consent_newsletter boolean not null default false,
  ip_address inet,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists idx_signatures_postal_code on signatures(postal_code);
create index if not exists idx_signatures_created_at on signatures(created_at);

alter table signatures enable row level security;

drop policy if exists "Public can insert signatures" on signatures;
create policy "Public can insert signatures" on signatures
  for insert to anon
  with check (
    char_length(first_name) between 2 and 80
    and char_length(last_name) between 2 and 80
    and char_length(email) between 4 and 160
    and postal_code ~ '^\d{5}$'
  );

drop policy if exists "Service role full access on signatures" on signatures;
create policy "Service role full access on signatures" on signatures
  for all to service_role using (true) with check (true);

-- Compteur public agrégé (pas de PII exposée)
drop view if exists public_signature_count;
create view public_signature_count as
  select count(*)::bigint as total from signatures;

grant select on public_signature_count to anon;

-- ---------- Établissements scolaires (Phase 3) ----------
create table if not exists establishments (
  uai text primary key,
  name text not null,
  type text,
  level text,
  status text,
  address text,
  postal_code text,
  city text,
  department_code text,
  department_name text,
  region_code text,
  region_name text,
  has_canteen boolean,
  latitude numeric,
  longitude numeric
);

create index if not exists idx_establishments_postal_code on establishments(postal_code);
create index if not exists idx_establishments_city on establishments(lower(city));

alter table establishments enable row level security;

drop policy if exists "Public can read establishments" on establishments;
create policy "Public can read establishments" on establishments
  for select to anon using (true);

drop policy if exists "Service role full access on establishments" on establishments;
create policy "Service role full access on establishments" on establishments
  for all to service_role using (true) with check (true);

-- ---------- Commandes de matériel (Phase 2) ----------
create table if not exists material_orders (
  id uuid primary key default gen_random_uuid(),
  signature_id uuid references signatures(id) on delete set null,
  flyer_a6 int not null default 0 check (flyer_a6 >= 0),
  flyer_a5 int not null default 0 check (flyer_a5 >= 0),
  poster_a3 int not null default 0 check (poster_a3 >= 0),
  petition_paper int not null default 0 check (petition_paper >= 0),
  total_weight_g int not null,
  shipping_cost_eur numeric(5,2) not null,
  shipping_address text not null,
  shipping_complement text,
  shipping_city text not null,
  shipping_postal_code text not null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz
);

alter table material_orders enable row level security;

drop policy if exists "Service role full access on material_orders" on material_orders;
create policy "Service role full access on material_orders" on material_orders
  for all to service_role using (true) with check (true);

-- ---------- Distributions (Phase 3) ----------
create table if not exists distributions (
  id uuid primary key default gen_random_uuid(),
  signature_id uuid references signatures(id) on delete set null,
  establishment_uai text references establishments(uai),
  custom_location text,
  custom_postal_code text,
  custom_city text,
  custom_latitude numeric,
  custom_longitude numeric,
  date date not null,
  start_time time not null,
  end_time time not null,
  organizer_first_name text not null,
  organizer_email text not null,
  organizer_phone text,
  is_public_visible boolean not null default true,
  is_organizer_contactable boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_distributions_date on distributions(date);
create index if not exists idx_distributions_establishment on distributions(establishment_uai);

alter table distributions enable row level security;

drop policy if exists "Public can insert distributions" on distributions;
create policy "Public can insert distributions" on distributions
  for insert to anon with check (
    date >= current_date
    and start_time < end_time
    and char_length(organizer_first_name) between 2 and 80
    and char_length(organizer_email) between 4 and 160
  );

drop policy if exists "Service role full access on distributions" on distributions;
create policy "Service role full access on distributions" on distributions
  for all to service_role using (true) with check (true);

-- Vue publique anonymisée (Phase 3 — carte)
drop view if exists public_distributions;
create view public_distributions as
  select
    d.id,
    d.date,
    d.start_time,
    d.end_time,
    d.establishment_uai,
    coalesce(e.name, d.custom_location) as location_name,
    e.type as establishment_type,
    coalesce(e.address, '')             as establishment_address,
    coalesce(e.postal_code, d.custom_postal_code) as postal_code,
    coalesce(e.city, d.custom_city)     as city,
    coalesce(e.latitude, d.custom_latitude)   as latitude,
    coalesce(e.longitude, d.custom_longitude) as longitude,
    d.is_organizer_contactable
  from distributions d
  left join establishments e on e.uai = d.establishment_uai
  where d.is_public_visible = true
    and d.date >= current_date;

grant select on public_distributions to anon;

-- Inscriptions « je rejoins cette distribution »
create table if not exists distribution_signups (
  id uuid primary key default gen_random_uuid(),
  distribution_id uuid not null references distributions(id) on delete cascade,
  signature_id uuid references signatures(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(distribution_id, signature_id)
);

alter table distribution_signups enable row level security;

drop policy if exists "Public can insert signups" on distribution_signups;
create policy "Public can insert signups" on distribution_signups
  for insert to anon with check (true);

drop policy if exists "Service role full access on signups" on distribution_signups;
create policy "Service role full access on signups" on distribution_signups
  for all to service_role using (true) with check (true);
