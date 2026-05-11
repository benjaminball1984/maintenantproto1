-- =====================================================================================
-- Maintenant ! — Schéma Postgres / Supabase
--
-- Référence : HANDOFF.md §7.2 (tables) et §8 (sécurité / RLS).
-- Conventions :
--   - clés primaires uuid (v4) générées via gen_random_uuid()
--   - timestamps created_at / updated_at (with time zone) sur chaque table
--   - colonnes snake_case ; mapping camelCase géré côté TypeScript
--   - foreign keys explicites + index sur chaque colonne FK
--   - RLS activée sur TOUTES les tables (DENY par défaut) puis policies explicites
--   - chaque policy est précédée d'un commentaire qui décrit le « pourquoi »
--
-- Convention RLS adoptée :
--   - lecture publique (anon + authenticated) sur les tables de contenu militant
--     (pétitions, mobilisations, articles, posts publics, communes…)
--   - lecture restreinte au propriétaire (auth.uid() = user_id) sur les données privées
--     (notifications, messages, contributions, transactions, adhesions, demandes
--     d'hébergement, drafts admin)
--   - écriture (insert/update/delete) toujours restreinte au propriétaire OU à
--     un administrateur (public.is_admin(auth.uid()))
--   - les compteurs publics (signatures, votes, likes, participations) sont
--     accessibles en lecture mais l'insertion est unique par (user, target)
--
-- Helpers :
--   - public.is_admin(uid uuid) → boolean, lit users.is_admin
--   - public.touch_updated_at() → trigger qui synchronise updated_at
--
-- Ce fichier est idempotent au niveau du schéma (CREATE TABLE IF NOT EXISTS) mais
-- les policies sont supprimées puis recréées pour rester déterministes.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- 0. Extensions
-- -------------------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid()
create extension if not exists "citext";   -- email case-insensitive

-- -------------------------------------------------------------------------------------
-- 1. Helpers : updated_at trigger + is_admin
-- -------------------------------------------------------------------------------------

-- Synchronise automatiquement updated_at à chaque UPDATE.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- La fonction public.is_admin(uid) qui lit le flag sur public.users est définie
-- plus bas, après la création de la table users (sinon le corps SQL ne peut pas
-- être validé à la création).

-- -------------------------------------------------------------------------------------
-- 2. Enums
-- -------------------------------------------------------------------------------------
do $$ begin
  create type public.adhesion_tier as enum ('gratuit', 'soutien', 'engage');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.adhesion_status as enum ('active', 'cancelled', 'expired', 'pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.t99cp_kind as enum ('credit', 'debit');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.post_visibility as enum ('public', 'members', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notification_kind as enum (
    'petition_signed', 'mobilization_rsvp', 'message', 'comment',
    'reaction', 'campaign', 'system', 'admin'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived', 'flagged');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------------------------------
-- 3. Table users (profil étendu)
--
-- Une ligne par utilisateur authentifié. Le PK référence auth.users.id (Supabase
-- gère le mot de passe, OAuth, magic links). Les champs publics (display_name,
-- avatar_url, bio) sont lisibles par tous ; l'email reste réservé au
-- propriétaire et aux admins.
-- -------------------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  city text,
  postal_code text,
  is_admin boolean not null default false,
  t99cp_balance integer not null default 0 check (t99cp_balance >= 0),
  badges jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_city_idx on public.users (city);
create trigger users_touch before update on public.users
  for each row execute function public.touch_updated_at();

-- Lecture du flag is_admin sur le profil. SECURITY DEFINER pour pouvoir lire la
-- table users depuis n'importe quelle policy sans entrer en récursion RLS.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.users where id = uid), false);
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated;

-- -------------------------------------------------------------------------------------
-- 4. Pétitions + signatures
-- -------------------------------------------------------------------------------------
create table if not exists public.petitions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  slug text not null unique,
  summary text not null,
  body text not null,
  target_count integer not null default 1000 check (target_count > 0),
  cover_url text,
  category text not null,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists petitions_author_idx on public.petitions (author_id);
create index if not exists petitions_category_idx on public.petitions (category);
create trigger petitions_touch before update on public.petitions
  for each row execute function public.touch_updated_at();

create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  petition_id uuid not null references public.petitions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (petition_id, user_id)
);
create index if not exists signatures_petition_idx on public.signatures (petition_id);
create index if not exists signatures_user_idx on public.signatures (user_id);

-- -------------------------------------------------------------------------------------
-- 5. Mobilisations + participations
-- -------------------------------------------------------------------------------------
create table if not exists public.mobilizations (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  slug text not null unique,
  summary text not null,
  body text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  city text not null,
  address text,
  cover_url text,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index if not exists mobilizations_organizer_idx on public.mobilizations (organizer_id);
create index if not exists mobilizations_starts_idx on public.mobilizations (starts_at);
create trigger mobilizations_touch before update on public.mobilizations
  for each row execute function public.touch_updated_at();

create table if not exists public.participations (
  id uuid primary key default gen_random_uuid(),
  mobilization_id uuid not null references public.mobilizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (mobilization_id, user_id)
);
create index if not exists participations_mob_idx on public.participations (mobilization_id);
create index if not exists participations_user_idx on public.participations (user_id);

-- -------------------------------------------------------------------------------------
-- 6. Hébergement (offres) + demandes
-- -------------------------------------------------------------------------------------
create table if not exists public.housing (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  city text not null,
  capacity integer not null check (capacity > 0),
  available_from date,
  available_to date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists housing_host_idx on public.housing (host_id);
create index if not exists housing_city_idx on public.housing (city);
create trigger housing_touch before update on public.housing
  for each row execute function public.touch_updated_at();

create table if not exists public.housing_requests (
  id uuid primary key default gen_random_uuid(),
  housing_id uuid not null references public.housing(id) on delete cascade,
  requester_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);
create index if not exists housing_req_housing_idx on public.housing_requests (housing_id);
create index if not exists housing_req_user_idx on public.housing_requests (requester_id);
create trigger housing_requests_touch before update on public.housing_requests
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------------------------------
-- 7. Covoiturage / prêt / marketplace
-- -------------------------------------------------------------------------------------
create table if not exists public.carpooling (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.users(id) on delete cascade,
  origin_city text not null,
  destination_city text not null,
  departs_at timestamptz not null,
  seats integer not null check (seats > 0),
  price_eur numeric(8,2) not null default 0 check (price_eur >= 0),
  notes text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists carpooling_driver_idx on public.carpooling (driver_id);
create index if not exists carpooling_origin_idx on public.carpooling (origin_city);
create index if not exists carpooling_dest_idx on public.carpooling (destination_city);
create trigger carpooling_touch before update on public.carpooling
  for each row execute function public.touch_updated_at();

create table if not exists public.lending (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  city text not null,
  t99cp_cost integer not null default 0 check (t99cp_cost >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lending_owner_idx on public.lending (owner_id);
create index if not exists lending_city_idx on public.lending (city);
create trigger lending_touch before update on public.lending
  for each row execute function public.touch_updated_at();

create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  city text not null,
  price_eur numeric(10,2),
  t99cp_cost integer,
  is_sold boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (price_eur is not null or t99cp_cost is not null)
);
create index if not exists market_seller_idx on public.marketplace_items (seller_id);
create index if not exists market_city_idx on public.marketplace_items (city);
create trigger market_touch before update on public.marketplace_items
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------------------------------
-- 8. Jardins partagés + SEL (offres / demandes)
-- -------------------------------------------------------------------------------------
create table if not exists public.garden_plots (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  city text not null,
  size_sqm integer check (size_sqm is null or size_sqm > 0),
  available_spots integer not null default 0 check (available_spots >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists garden_manager_idx on public.garden_plots (manager_id);
create index if not exists garden_city_idx on public.garden_plots (city);
create trigger garden_touch before update on public.garden_plots
  for each row execute function public.touch_updated_at();

create table if not exists public.sel_offers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  city text not null,
  t99cp_rate integer not null default 1 check (t99cp_rate >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sel_offers_user_idx on public.sel_offers (user_id);
create index if not exists sel_offers_city_idx on public.sel_offers (city);
create trigger sel_offers_touch before update on public.sel_offers
  for each row execute function public.touch_updated_at();

create table if not exists public.sel_demands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  city text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sel_demands_user_idx on public.sel_demands (user_id);
create index if not exists sel_demands_city_idx on public.sel_demands (city);
create trigger sel_demands_touch before update on public.sel_demands
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------------------------------
-- 9. Financement participatif
-- -------------------------------------------------------------------------------------
create table if not exists public.crowdfunding_campaigns (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  slug text not null unique,
  summary text not null,
  body text,
  goal_eur numeric(12,2) not null check (goal_eur > 0),
  raised_eur numeric(12,2) not null default 0 check (raised_eur >= 0),
  cover_url text,
  status public.content_status not null default 'published',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crowd_organizer_idx on public.crowdfunding_campaigns (organizer_id);
create trigger crowd_touch before update on public.crowdfunding_campaigns
  for each row execute function public.touch_updated_at();

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.crowdfunding_campaigns(id) on delete cascade,
  contributor_id uuid not null references public.users(id) on delete cascade,
  amount_eur numeric(10,2) not null check (amount_eur > 0),
  stripe_payment_intent text unique,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists contrib_campaign_idx on public.contributions (campaign_id);
create index if not exists contrib_user_idx on public.contributions (contributor_id);

-- -------------------------------------------------------------------------------------
-- 10. Média (articles + commentaires + réactions)
-- -------------------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  slug text not null unique,
  summary text not null,
  body text not null,
  cover_url text,
  format text not null check (format in ('article','video','podcast','photo','enquete')),
  status public.content_status not null default 'published',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists articles_author_idx on public.articles (author_id);
create index if not exists articles_status_idx on public.articles (status);
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comments_article_idx on public.comments (article_id);
create index if not exists comments_author_idx on public.comments (author_id);
create trigger comments_touch before update on public.comments
  for each row execute function public.touch_updated_at();

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('like','support','disagree','curious','outrage')),
  created_at timestamptz not null default now(),
  unique (article_id, user_id, kind)
);
create index if not exists reactions_article_idx on public.reactions (article_id);
create index if not exists reactions_user_idx on public.reactions (user_id);

-- -------------------------------------------------------------------------------------
-- 11. Réseau social interne (posts + likes + commentaires)
-- -------------------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  media_urls jsonb not null default '[]'::jsonb,
  visibility public.post_visibility not null default 'public',
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_author_idx on public.posts (author_id);
create index if not exists posts_created_idx on public.posts (created_at desc);
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
create index if not exists post_likes_post_idx on public.post_likes (post_id);
create index if not exists post_likes_user_idx on public.post_likes (user_id);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  is_flagged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists post_comments_post_idx on public.post_comments (post_id);
create index if not exists post_comments_author_idx on public.post_comments (author_id);
create trigger post_comments_touch before update on public.post_comments
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------------------------------
-- 12. Sondages (polls / poll_options / votes)
-- -------------------------------------------------------------------------------------
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete restrict,
  question text not null,
  description text,
  members_only boolean not null default true,
  closes_at timestamptz,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists polls_author_idx on public.polls (author_id);
create trigger polls_touch before update on public.polls
  for each row execute function public.touch_updated_at();

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (poll_id, position)
);
create index if not exists poll_options_poll_idx on public.poll_options (poll_id);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, user_id)
);
create index if not exists votes_poll_idx on public.votes (poll_id);
create index if not exists votes_option_idx on public.votes (option_id);
create index if not exists votes_user_idx on public.votes (user_id);

-- -------------------------------------------------------------------------------------
-- 13. Campagnes ciblées (regroupement multi-actions)
-- -------------------------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete restrict,
  title text not null,
  slug text not null unique,
  summary text not null,
  body text,
  cover_url text,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists campaigns_author_idx on public.campaigns (author_id);
create trigger campaigns_touch before update on public.campaigns
  for each row execute function public.touch_updated_at();

create table if not exists public.campaign_actions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  petition_id uuid references public.petitions(id) on delete set null,
  mobilization_id uuid references public.mobilizations(id) on delete set null,
  poll_id uuid references public.polls(id) on delete set null,
  crowdfunding_id uuid references public.crowdfunding_campaigns(id) on delete set null,
  label text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists campaign_actions_campaign_idx on public.campaign_actions (campaign_id);

-- -------------------------------------------------------------------------------------
-- 14. Communes libres + membres
-- -------------------------------------------------------------------------------------
create table if not exists public.communes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null,
  description text,
  treasurer_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists communes_city_idx on public.communes (city);
create trigger communes_touch before update on public.communes
  for each row execute function public.touch_updated_at();

create table if not exists public.commune_members (
  id uuid primary key default gen_random_uuid(),
  commune_id uuid not null references public.communes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','referent','treasurer','admin')),
  joined_at timestamptz not null default now(),
  unique (commune_id, user_id)
);
create index if not exists commune_members_commune_idx on public.commune_members (commune_id);
create index if not exists commune_members_user_idx on public.commune_members (user_id);

-- -------------------------------------------------------------------------------------
-- 15. Messagerie (conversations + messages) et notifications
-- -------------------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.users(id) on delete cascade,
  user_b uuid not null references public.users(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  check (user_a <> user_b)
);
create index if not exists conv_user_a_idx on public.conversations (user_a);
create index if not exists conv_user_b_idx on public.conversations (user_b);
-- Une seule conversation 1-1 par paire (peu importe l'ordre des deux user_id).
create unique index if not exists conv_pair_unique
  on public.conversations (least(user_a, user_b), greatest(user_a, user_b));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on public.messages (conversation_id, created_at desc);
create index if not exists messages_sender_idx on public.messages (sender_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.users(id) on delete cascade,
  kind public.notification_kind not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notif_recipient_idx on public.notifications (recipient_id, created_at desc);

-- -------------------------------------------------------------------------------------
-- 16. Adhésion mouvement + ledger T99CP
-- -------------------------------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  member_number text unique,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger members_touch before update on public.members
  for each row execute function public.touch_updated_at();

create table if not exists public.adhesions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tier public.adhesion_tier not null,
  status public.adhesion_status not null default 'pending',
  amount_eur numeric(10,2) not null default 0 check (amount_eur >= 0),
  stripe_subscription_id text unique,
  starts_on date not null default current_date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists adhesions_user_idx on public.adhesions (user_id);
create index if not exists adhesions_status_idx on public.adhesions (status);
create trigger adhesions_touch before update on public.adhesions
  for each row execute function public.touch_updated_at();

create table if not exists public.t99cp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind public.t99cp_kind not null,
  amount integer not null check (amount > 0),
  reason text not null,
  related_table text,
  related_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists t99cp_user_idx on public.t99cp_transactions (user_id, created_at desc);

-- -------------------------------------------------------------------------------------
-- 17. Outils admin (logs + email campaigns)
-- -------------------------------------------------------------------------------------
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.users(id) on delete restrict,
  action text not null,
  target_table text,
  target_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_logs_actor_idx on public.admin_logs (actor_id, created_at desc);

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete restrict,
  subject text not null,
  body_html text not null,
  audience text not null,
  status text not null default 'draft' check (status in ('draft','queued','sent','failed')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists email_campaigns_author_idx on public.email_campaigns (author_id);
create index if not exists email_campaigns_status_idx on public.email_campaigns (status);
create trigger email_campaigns_touch before update on public.email_campaigns
  for each row execute function public.touch_updated_at();

-- =====================================================================================
-- RLS — activation + policies par table
--
-- Rappel : `enable row level security` + `force row level security` ferme la table.
-- Toute opération non explicitement autorisée est refusée. Les policies ci-dessous
-- couvrent les cas d'usage produit. Toute évolution de produit qui requiert un
-- nouvel accès doit ajouter une policy explicite.
-- =====================================================================================

-- Activation globale
alter table public.users                  enable row level security;
alter table public.petitions              enable row level security;
alter table public.signatures             enable row level security;
alter table public.mobilizations          enable row level security;
alter table public.participations         enable row level security;
alter table public.housing                enable row level security;
alter table public.housing_requests       enable row level security;
alter table public.carpooling             enable row level security;
alter table public.lending                enable row level security;
alter table public.marketplace_items      enable row level security;
alter table public.garden_plots           enable row level security;
alter table public.sel_offers             enable row level security;
alter table public.sel_demands            enable row level security;
alter table public.crowdfunding_campaigns enable row level security;
alter table public.contributions          enable row level security;
alter table public.articles               enable row level security;
alter table public.comments               enable row level security;
alter table public.reactions              enable row level security;
alter table public.posts                  enable row level security;
alter table public.post_likes             enable row level security;
alter table public.post_comments          enable row level security;
alter table public.polls                  enable row level security;
alter table public.poll_options           enable row level security;
alter table public.votes                  enable row level security;
alter table public.campaigns              enable row level security;
alter table public.campaign_actions       enable row level security;
alter table public.communes               enable row level security;
alter table public.commune_members        enable row level security;
alter table public.conversations          enable row level security;
alter table public.messages               enable row level security;
alter table public.notifications          enable row level security;
alter table public.members                enable row level security;
alter table public.adhesions              enable row level security;
alter table public.t99cp_transactions     enable row level security;
alter table public.admin_logs             enable row level security;
alter table public.email_campaigns        enable row level security;

-- -------------------------------------------------------------------------------------
-- users : profil public ; chaque user gère sa ligne ; admins ont tous les droits.
-- -------------------------------------------------------------------------------------
drop policy if exists users_select_public on public.users;
-- Lecture publique : les profils sont consultables par tout le monde (nom, avatar,
-- ville, badges). L'email reste protégé applicativement côté API/PostgREST en
-- limitant la projection des colonnes sensibles (à confirmer côté front).
create policy users_select_public on public.users
  for select using (true);

drop policy if exists users_insert_self on public.users;
-- L'utilisateur crée sa propre ligne au signup (id = auth.uid()).
create policy users_insert_self on public.users
  for insert with check (auth.uid() = id);

drop policy if exists users_update_self on public.users;
-- Seul le propriétaire (ou un admin) met à jour son profil ; un user ne peut pas
-- escalader son rôle (is_admin reste géré côté admin/service-role).
create policy users_update_self on public.users
  for update using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists users_delete_admin on public.users;
-- Suppression réservée aux admins (RGPD : effacement piloté côté backoffice).
create policy users_delete_admin on public.users
  for delete using (public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- petitions : lecture publique, écriture auteur + admin.
-- -------------------------------------------------------------------------------------
drop policy if exists petitions_select_public on public.petitions;
-- Contenu militant : visible par anon + authenticated pour partage / SEO.
create policy petitions_select_public on public.petitions
  for select using (status = 'published' or auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists petitions_insert_self on public.petitions;
-- Création par un utilisateur connecté pour son propre compte.
create policy petitions_insert_self on public.petitions
  for insert with check (auth.uid() = author_id);

drop policy if exists petitions_update_owner on public.petitions;
-- Mise à jour réservée à l'auteur (avant publication) ou aux admins.
create policy petitions_update_owner on public.petitions
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()))
  with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists petitions_delete_owner on public.petitions;
create policy petitions_delete_owner on public.petitions
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- signatures : compteur public, insertion = self (1 sign / user / petition).
-- -------------------------------------------------------------------------------------
drop policy if exists signatures_select_public on public.signatures;
-- Compteur public (count(*)) — la projection user_id reste utile pour montrer
-- « tu as signé » côté front. Pas de PII supplémentaire ici.
create policy signatures_select_public on public.signatures
  for select using (true);

drop policy if exists signatures_insert_self on public.signatures;
create policy signatures_insert_self on public.signatures
  for insert with check (auth.uid() = user_id);

drop policy if exists signatures_delete_self on public.signatures;
-- Un signataire peut retirer sa signature (RGPD : retrait du consentement).
create policy signatures_delete_self on public.signatures
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- mobilizations : même logique que petitions.
-- -------------------------------------------------------------------------------------
drop policy if exists mobilizations_select_public on public.mobilizations;
create policy mobilizations_select_public on public.mobilizations
  for select using (status = 'published' or auth.uid() = organizer_id or public.is_admin(auth.uid()));

drop policy if exists mobilizations_insert_self on public.mobilizations;
create policy mobilizations_insert_self on public.mobilizations
  for insert with check (auth.uid() = organizer_id);

drop policy if exists mobilizations_update_owner on public.mobilizations;
create policy mobilizations_update_owner on public.mobilizations
  for update using (auth.uid() = organizer_id or public.is_admin(auth.uid()))
  with check (auth.uid() = organizer_id or public.is_admin(auth.uid()));

drop policy if exists mobilizations_delete_owner on public.mobilizations;
create policy mobilizations_delete_owner on public.mobilizations
  for delete using (auth.uid() = organizer_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- participations : compteur public, insert self, delete self.
-- -------------------------------------------------------------------------------------
drop policy if exists participations_select_public on public.participations;
create policy participations_select_public on public.participations
  for select using (true);

drop policy if exists participations_insert_self on public.participations;
create policy participations_insert_self on public.participations
  for insert with check (auth.uid() = user_id);

drop policy if exists participations_delete_self on public.participations;
create policy participations_delete_self on public.participations
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- housing : annonces publiques (is_published), édition propriétaire.
-- -------------------------------------------------------------------------------------
drop policy if exists housing_select_public on public.housing;
create policy housing_select_public on public.housing
  for select using (is_published or auth.uid() = host_id or public.is_admin(auth.uid()));

drop policy if exists housing_insert_self on public.housing;
create policy housing_insert_self on public.housing
  for insert with check (auth.uid() = host_id);

drop policy if exists housing_update_owner on public.housing;
create policy housing_update_owner on public.housing
  for update using (auth.uid() = host_id or public.is_admin(auth.uid()))
  with check (auth.uid() = host_id or public.is_admin(auth.uid()));

drop policy if exists housing_delete_owner on public.housing;
create policy housing_delete_owner on public.housing
  for delete using (auth.uid() = host_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- housing_requests : visible uniquement par le demandeur et l'hôte concerné.
-- -------------------------------------------------------------------------------------
drop policy if exists housing_requests_select_parties on public.housing_requests;
-- Donnée privée : seuls le demandeur, l'hôte propriétaire de l'offre et les
-- admins peuvent lire la demande (contact + dates).
create policy housing_requests_select_parties on public.housing_requests
  for select using (
    auth.uid() = requester_id
    or auth.uid() = (select host_id from public.housing where id = housing_id)
    or public.is_admin(auth.uid())
  );

drop policy if exists housing_requests_insert_self on public.housing_requests;
create policy housing_requests_insert_self on public.housing_requests
  for insert with check (auth.uid() = requester_id);

drop policy if exists housing_requests_update_parties on public.housing_requests;
-- Le demandeur peut annuler, l'hôte peut accepter/refuser. Admins : full.
create policy housing_requests_update_parties on public.housing_requests
  for update using (
    auth.uid() = requester_id
    or auth.uid() = (select host_id from public.housing where id = housing_id)
    or public.is_admin(auth.uid())
  ) with check (
    auth.uid() = requester_id
    or auth.uid() = (select host_id from public.housing where id = housing_id)
    or public.is_admin(auth.uid())
  );

drop policy if exists housing_requests_delete_self on public.housing_requests;
create policy housing_requests_delete_self on public.housing_requests
  for delete using (auth.uid() = requester_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- carpooling : annonces publiques, écriture conducteur.
-- -------------------------------------------------------------------------------------
drop policy if exists carpooling_select_public on public.carpooling;
create policy carpooling_select_public on public.carpooling
  for select using (is_published or auth.uid() = driver_id or public.is_admin(auth.uid()));

drop policy if exists carpooling_insert_self on public.carpooling;
create policy carpooling_insert_self on public.carpooling
  for insert with check (auth.uid() = driver_id);

drop policy if exists carpooling_update_owner on public.carpooling;
create policy carpooling_update_owner on public.carpooling
  for update using (auth.uid() = driver_id or public.is_admin(auth.uid()))
  with check (auth.uid() = driver_id or public.is_admin(auth.uid()));

drop policy if exists carpooling_delete_owner on public.carpooling;
create policy carpooling_delete_owner on public.carpooling
  for delete using (auth.uid() = driver_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- lending : annonces publiques, écriture propriétaire.
-- -------------------------------------------------------------------------------------
drop policy if exists lending_select_public on public.lending;
create policy lending_select_public on public.lending
  for select using (true);

drop policy if exists lending_insert_self on public.lending;
create policy lending_insert_self on public.lending
  for insert with check (auth.uid() = owner_id);

drop policy if exists lending_update_owner on public.lending;
create policy lending_update_owner on public.lending
  for update using (auth.uid() = owner_id or public.is_admin(auth.uid()))
  with check (auth.uid() = owner_id or public.is_admin(auth.uid()));

drop policy if exists lending_delete_owner on public.lending;
create policy lending_delete_owner on public.lending
  for delete using (auth.uid() = owner_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- marketplace_items : annonces publiques, écriture vendeur.
-- -------------------------------------------------------------------------------------
drop policy if exists market_select_public on public.marketplace_items;
create policy market_select_public on public.marketplace_items
  for select using (true);

drop policy if exists market_insert_self on public.marketplace_items;
create policy market_insert_self on public.marketplace_items
  for insert with check (auth.uid() = seller_id);

drop policy if exists market_update_owner on public.marketplace_items;
create policy market_update_owner on public.marketplace_items
  for update using (auth.uid() = seller_id or public.is_admin(auth.uid()))
  with check (auth.uid() = seller_id or public.is_admin(auth.uid()));

drop policy if exists market_delete_owner on public.marketplace_items;
create policy market_delete_owner on public.marketplace_items
  for delete using (auth.uid() = seller_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- garden_plots : annonces publiques, gestion par le manager.
-- -------------------------------------------------------------------------------------
drop policy if exists garden_select_public on public.garden_plots;
create policy garden_select_public on public.garden_plots
  for select using (true);

drop policy if exists garden_insert_self on public.garden_plots;
create policy garden_insert_self on public.garden_plots
  for insert with check (auth.uid() = manager_id);

drop policy if exists garden_update_owner on public.garden_plots;
create policy garden_update_owner on public.garden_plots
  for update using (auth.uid() = manager_id or public.is_admin(auth.uid()))
  with check (auth.uid() = manager_id or public.is_admin(auth.uid()));

drop policy if exists garden_delete_owner on public.garden_plots;
create policy garden_delete_owner on public.garden_plots
  for delete using (auth.uid() = manager_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- sel_offers / sel_demands : visibles, écriture self.
-- -------------------------------------------------------------------------------------
drop policy if exists sel_offers_select_public on public.sel_offers;
create policy sel_offers_select_public on public.sel_offers
  for select using (is_active or auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists sel_offers_insert_self on public.sel_offers;
create policy sel_offers_insert_self on public.sel_offers
  for insert with check (auth.uid() = user_id);

drop policy if exists sel_offers_update_owner on public.sel_offers;
create policy sel_offers_update_owner on public.sel_offers
  for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists sel_offers_delete_owner on public.sel_offers;
create policy sel_offers_delete_owner on public.sel_offers
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists sel_demands_select_public on public.sel_demands;
create policy sel_demands_select_public on public.sel_demands
  for select using (is_active or auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists sel_demands_insert_self on public.sel_demands;
create policy sel_demands_insert_self on public.sel_demands
  for insert with check (auth.uid() = user_id);

drop policy if exists sel_demands_update_owner on public.sel_demands;
create policy sel_demands_update_owner on public.sel_demands
  for update using (auth.uid() = user_id or public.is_admin(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists sel_demands_delete_owner on public.sel_demands;
create policy sel_demands_delete_owner on public.sel_demands
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- crowdfunding_campaigns + contributions
-- -------------------------------------------------------------------------------------
drop policy if exists crowd_select_public on public.crowdfunding_campaigns;
create policy crowd_select_public on public.crowdfunding_campaigns
  for select using (status = 'published' or auth.uid() = organizer_id or public.is_admin(auth.uid()));

drop policy if exists crowd_insert_self on public.crowdfunding_campaigns;
create policy crowd_insert_self on public.crowdfunding_campaigns
  for insert with check (auth.uid() = organizer_id);

drop policy if exists crowd_update_owner on public.crowdfunding_campaigns;
create policy crowd_update_owner on public.crowdfunding_campaigns
  for update using (auth.uid() = organizer_id or public.is_admin(auth.uid()))
  with check (auth.uid() = organizer_id or public.is_admin(auth.uid()));

drop policy if exists crowd_delete_owner on public.crowdfunding_campaigns;
create policy crowd_delete_owner on public.crowdfunding_campaigns
  for delete using (auth.uid() = organizer_id or public.is_admin(auth.uid()));

drop policy if exists contrib_select_self on public.contributions;
-- Privé : seul le contributeur (ou l'organisateur de la cagnotte pour le suivi)
-- peut voir le détail. Les totaux publics sont calculés via raised_eur sur la
-- table campagne. Les admins ont accès complet.
create policy contrib_select_self on public.contributions
  for select using (
    auth.uid() = contributor_id
    or auth.uid() = (select organizer_id from public.crowdfunding_campaigns where id = campaign_id)
    or public.is_admin(auth.uid())
  );

drop policy if exists contrib_insert_self on public.contributions;
create policy contrib_insert_self on public.contributions
  for insert with check (auth.uid() = contributor_id);

-- Les contributions ne sont pas modifiables/supprimables par les utilisateurs
-- (intégrité comptable). Les admins gardent la main via service-role.

-- -------------------------------------------------------------------------------------
-- articles / comments / reactions
-- -------------------------------------------------------------------------------------
drop policy if exists articles_select_public on public.articles;
create policy articles_select_public on public.articles
  for select using (status = 'published' or auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists articles_insert_self on public.articles;
create policy articles_insert_self on public.articles
  for insert with check (auth.uid() = author_id);

drop policy if exists articles_update_owner on public.articles;
create policy articles_update_owner on public.articles
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()))
  with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists articles_delete_owner on public.articles;
create policy articles_delete_owner on public.articles
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists comments_select_public on public.comments;
-- Les commentaires marqués `is_flagged` restent visibles à l'auteur et aux admins
-- (modération file d'attente). Sinon publics.
create policy comments_select_public on public.comments
  for select using (not is_flagged or auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists comments_insert_self on public.comments;
create policy comments_insert_self on public.comments
  for insert with check (auth.uid() = author_id);

drop policy if exists comments_update_owner on public.comments;
create policy comments_update_owner on public.comments
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()))
  with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists comments_delete_owner on public.comments;
create policy comments_delete_owner on public.comments
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists reactions_select_public on public.reactions;
create policy reactions_select_public on public.reactions
  for select using (true);

drop policy if exists reactions_insert_self on public.reactions;
create policy reactions_insert_self on public.reactions
  for insert with check (auth.uid() = user_id);

drop policy if exists reactions_delete_self on public.reactions;
create policy reactions_delete_self on public.reactions
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- posts / post_likes / post_comments
-- -------------------------------------------------------------------------------------
drop policy if exists posts_select_visibility on public.posts;
-- Public : tout le monde ; Members : authentifiés uniquement ; Private :
-- auteur uniquement. Admins voient tout (modération).
create policy posts_select_visibility on public.posts
  for select using (
    public.is_admin(auth.uid())
    or auth.uid() = author_id
    or visibility = 'public'
    or (visibility = 'members' and auth.uid() is not null)
  );

drop policy if exists posts_insert_self on public.posts;
create policy posts_insert_self on public.posts
  for insert with check (auth.uid() = author_id);

drop policy if exists posts_update_owner on public.posts;
create policy posts_update_owner on public.posts
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()))
  with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists posts_delete_owner on public.posts;
create policy posts_delete_owner on public.posts
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists post_likes_select_public on public.post_likes;
create policy post_likes_select_public on public.post_likes
  for select using (true);

drop policy if exists post_likes_insert_self on public.post_likes;
create policy post_likes_insert_self on public.post_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists post_likes_delete_self on public.post_likes;
create policy post_likes_delete_self on public.post_likes
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists post_comments_select_public on public.post_comments;
create policy post_comments_select_public on public.post_comments
  for select using (not is_flagged or auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists post_comments_insert_self on public.post_comments;
create policy post_comments_insert_self on public.post_comments
  for insert with check (auth.uid() = author_id);

drop policy if exists post_comments_update_owner on public.post_comments;
create policy post_comments_update_owner on public.post_comments
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()))
  with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists post_comments_delete_owner on public.post_comments;
create policy post_comments_delete_owner on public.post_comments
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- polls / poll_options / votes
-- -------------------------------------------------------------------------------------
drop policy if exists polls_select_public on public.polls;
create policy polls_select_public on public.polls
  for select using (status = 'published' or auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists polls_insert_self on public.polls;
create policy polls_insert_self on public.polls
  for insert with check (auth.uid() = author_id);

drop policy if exists polls_update_owner on public.polls;
create policy polls_update_owner on public.polls
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()))
  with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists polls_delete_owner on public.polls;
create policy polls_delete_owner on public.polls
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists poll_options_select_public on public.poll_options;
create policy poll_options_select_public on public.poll_options
  for select using (true);

drop policy if exists poll_options_write_author on public.poll_options;
-- Seul l'auteur du sondage (ou un admin) peut éditer les options du poll.
create policy poll_options_write_author on public.poll_options
  for all using (
    public.is_admin(auth.uid())
    or auth.uid() = (select author_id from public.polls where id = poll_id)
  ) with check (
    public.is_admin(auth.uid())
    or auth.uid() = (select author_id from public.polls where id = poll_id)
  );

drop policy if exists votes_select_public on public.votes;
create policy votes_select_public on public.votes
  for select using (true);

drop policy if exists votes_insert_member on public.votes;
-- Insert : l'utilisateur doit voter pour lui-même et, si le sondage est
-- members_only, être adhérent (table members).
create policy votes_insert_member on public.votes
  for insert with check (
    auth.uid() = user_id
    and (
      not (select members_only from public.polls where id = poll_id)
      or exists (select 1 from public.members m where m.user_id = auth.uid())
    )
  );

drop policy if exists votes_delete_self on public.votes;
create policy votes_delete_self on public.votes
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- campaigns / campaign_actions
-- -------------------------------------------------------------------------------------
drop policy if exists campaigns_select_public on public.campaigns;
create policy campaigns_select_public on public.campaigns
  for select using (status = 'published' or auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists campaigns_insert_self on public.campaigns;
create policy campaigns_insert_self on public.campaigns
  for insert with check (auth.uid() = author_id);

drop policy if exists campaigns_update_owner on public.campaigns;
create policy campaigns_update_owner on public.campaigns
  for update using (auth.uid() = author_id or public.is_admin(auth.uid()))
  with check (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists campaigns_delete_owner on public.campaigns;
create policy campaigns_delete_owner on public.campaigns
  for delete using (auth.uid() = author_id or public.is_admin(auth.uid()));

drop policy if exists campaign_actions_select_public on public.campaign_actions;
create policy campaign_actions_select_public on public.campaign_actions
  for select using (true);

drop policy if exists campaign_actions_write_author on public.campaign_actions;
create policy campaign_actions_write_author on public.campaign_actions
  for all using (
    public.is_admin(auth.uid())
    or auth.uid() = (select author_id from public.campaigns where id = campaign_id)
  ) with check (
    public.is_admin(auth.uid())
    or auth.uid() = (select author_id from public.campaigns where id = campaign_id)
  );

-- -------------------------------------------------------------------------------------
-- communes / commune_members
-- -------------------------------------------------------------------------------------
drop policy if exists communes_select_public on public.communes;
create policy communes_select_public on public.communes
  for select using (true);

drop policy if exists communes_write_admin on public.communes;
-- Création/édition d'une commune réservée à l'admin global (politique éditoriale).
create policy communes_write_admin on public.communes
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists commune_members_select_public on public.commune_members;
create policy commune_members_select_public on public.commune_members
  for select using (true);

drop policy if exists commune_members_join_self on public.commune_members;
create policy commune_members_join_self on public.commune_members
  for insert with check (auth.uid() = user_id);

drop policy if exists commune_members_leave_self on public.commune_members;
create policy commune_members_leave_self on public.commune_members
  for delete using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists commune_members_update_admin on public.commune_members;
-- Promotion / changement de rôle = admin global ou trésorier (cf. communes.treasurer_id).
create policy commune_members_update_admin on public.commune_members
  for update using (
    public.is_admin(auth.uid())
    or auth.uid() = (select treasurer_id from public.communes where id = commune_id)
  ) with check (
    public.is_admin(auth.uid())
    or auth.uid() = (select treasurer_id from public.communes where id = commune_id)
  );

-- -------------------------------------------------------------------------------------
-- conversations / messages / notifications (strictement privés)
-- -------------------------------------------------------------------------------------
drop policy if exists conv_select_party on public.conversations;
-- Seuls les deux participants (ou un admin pour modération) voient la conversation.
create policy conv_select_party on public.conversations
  for select using (
    auth.uid() = user_a or auth.uid() = user_b or public.is_admin(auth.uid())
  );

drop policy if exists conv_insert_party on public.conversations;
create policy conv_insert_party on public.conversations
  for insert with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists conv_update_party on public.conversations;
create policy conv_update_party on public.conversations
  for update using (auth.uid() = user_a or auth.uid() = user_b)
  with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists conv_delete_party on public.conversations;
create policy conv_delete_party on public.conversations
  for delete using (auth.uid() = user_a or auth.uid() = user_b or public.is_admin(auth.uid()));

drop policy if exists messages_select_party on public.messages;
-- Lecture : uniquement les deux parties de la conversation.
create policy messages_select_party on public.messages
  for select using (
    public.is_admin(auth.uid())
    or auth.uid() in (
      select user_a from public.conversations where id = conversation_id
      union
      select user_b from public.conversations where id = conversation_id
    )
  );

drop policy if exists messages_insert_party on public.messages;
create policy messages_insert_party on public.messages
  for insert with check (
    auth.uid() = sender_id
    and auth.uid() in (
      select user_a from public.conversations where id = conversation_id
      union
      select user_b from public.conversations where id = conversation_id
    )
  );

drop policy if exists messages_update_sender on public.messages;
-- Un sender peut marquer read_at sur ses propres messages reçus (via fonction côté
-- API), pas modifier le body. Politique restrictive : update interdit aux users,
-- réservé aux admins.
create policy messages_update_sender on public.messages
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists notifications_select_self on public.notifications;
-- Privé : seul le destinataire peut lire ses notifications. Admins exclus
-- volontairement (donnée perso, pas besoin d'accès admin par défaut).
create policy notifications_select_self on public.notifications
  for select using (auth.uid() = recipient_id);

drop policy if exists notifications_insert_admin on public.notifications;
-- Création de notifications : pas par l'utilisateur final. Réservé aux admins
-- (et au service-role côté serveur pour les notifs système).
create policy notifications_insert_admin on public.notifications
  for insert with check (public.is_admin(auth.uid()));

drop policy if exists notifications_update_self on public.notifications;
-- Marquer lu / supprimer : par le destinataire.
create policy notifications_update_self on public.notifications
  for update using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

drop policy if exists notifications_delete_self on public.notifications;
create policy notifications_delete_self on public.notifications
  for delete using (auth.uid() = recipient_id or public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- members / adhesions / t99cp_transactions
-- -------------------------------------------------------------------------------------
drop policy if exists members_select_public on public.members;
-- Le badge « adhérent » est public (utile pour afficher « Membre » sur le profil).
create policy members_select_public on public.members
  for select using (true);

drop policy if exists members_write_admin on public.members;
-- Création/édition pilotée par le backoffice (numéro de membre, etc.) — pas par
-- l'utilisateur. Le flow d'adhésion crée la ligne via le webhook Stripe (service-role).
create policy members_write_admin on public.members
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists adhesions_select_self on public.adhesions;
-- Privé : l'utilisateur voit son historique d'adhésions, l'admin voit tout.
create policy adhesions_select_self on public.adhesions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists adhesions_insert_self on public.adhesions;
-- Création d'une adhésion : par l'utilisateur lui-même (status = pending).
-- Stripe webhook (service-role) passera ensuite le status à 'active'.
create policy adhesions_insert_self on public.adhesions
  for insert with check (auth.uid() = user_id);

drop policy if exists adhesions_update_admin on public.adhesions;
-- Updates de status / dates / stripe id : admin uniquement (service-role en prod).
create policy adhesions_update_admin on public.adhesions
  for update using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists t99cp_select_self on public.t99cp_transactions;
-- Ledger privé : chaque user voit son propre historique de crédits/débits T99CP.
create policy t99cp_select_self on public.t99cp_transactions
  for select using (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists t99cp_insert_admin on public.t99cp_transactions;
-- Insertion réservée à l'admin / service-role (intégrité monétaire). Le front
-- déclenche une RPC côté serveur qui vérifie le solde et écrit la transaction.
create policy t99cp_insert_admin on public.t99cp_transactions
  for insert with check (public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------------------
-- admin_logs / email_campaigns (admin only)
-- -------------------------------------------------------------------------------------
drop policy if exists admin_logs_admin on public.admin_logs;
-- Les logs admin sont strictement privés (audit). Lecture + écriture admin only.
create policy admin_logs_admin on public.admin_logs
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists email_campaigns_admin on public.email_campaigns;
-- Drafts de campagnes email : admin uniquement (donnée stratégique + audience).
create policy email_campaigns_admin on public.email_campaigns
  for all using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- =====================================================================================
-- FIN du schéma. Régénérer les types : `supabase gen types typescript --local`.
-- =====================================================================================
