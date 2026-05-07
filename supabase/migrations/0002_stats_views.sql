-- =====================================================================
-- Vues publiques pour la page /chiffres et la carte
-- =====================================================================

-- Total signataires (déjà créée en 0001) — alias pour clarté
-- create view public_signature_count → définie dans 0001_init.sql

-- Compteurs principaux (un seul scan, lecture rapide)
drop view if exists public_stats;
create view public_stats as
  select
    (select count(*) from signatures)::bigint                                  as total_signatures,
    (select count(*) from distributions where date >= current_date)::bigint    as upcoming_distributions,
    (select count(*) from distributions)::bigint                               as total_distributions,
    (select count(distinct postal_code) from signatures)::bigint               as cities_count;

grant select on public_stats to anon;

-- Top 10 villes (par code postal — anonymisé)
drop view if exists public_top_cities;
create view public_top_cities as
  select postal_code, count(*)::bigint as signatures
  from signatures
  where postal_code is not null
  group by postal_code
  order by signatures desc
  limit 10;

grant select on public_top_cities to anon;

-- Densité par département (chloropleth)
drop view if exists public_signatures_by_department;
create view public_signatures_by_department as
  select substring(postal_code, 1, 2) as dept_code,
         count(*)::bigint as signatures
  from signatures
  where postal_code ~ '^\d{5}$'
  group by 1
  order by signatures desc;

grant select on public_signatures_by_department to anon;
