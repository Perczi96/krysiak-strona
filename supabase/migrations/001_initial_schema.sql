-- ============================================
-- BEZ MASKI - Initial Schema (v1)
-- PostgreSQL 15+ / Supabase
-- ============================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- ENUMS / TYPES
-- ============================================

create type user_role as enum ('guest', 'subscriber', 'supporter', 'admin');
create type content_visibility as enum ('public', 'subscriber', 'supporter');
create type content_type as enum ('video', 'audio', 'pdf', 'post', 'live');
create type video_provider as enum ('youtube', 'bunny', 'vimeo');
create type subscription_status as enum ('active', 'past_due', 'canceled', 'incomplete', 'trialing');
create type payment_event_type as enum (
  'checkout.completed',
  'subscription.created',
  'subscription.updated',
  'subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.trial_will_end',
  'manual_grant'
);

-- ============================================
-- TABLES
-- ============================================

-- Taryfy (poziomy wsparcia)
create table tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_monthly_pln int not null,          -- w groszach (np. 500 = 5,00 PLN)
  price_yearly_pln int,                    -- opcjonalnie
  description text,
  benefits text[] default '{}',
  sort_order int default 0,
  active boolean default true,
  stripe_price_id_monthly text unique,     -- Stripe Price ID (monthly)
  stripe_price_id_yearly text unique,      -- Stripe Price ID (yearly)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profile użytkowników (rozszerza auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,
  role user_role not null default 'guest',
  tier_id uuid references tiers(id),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status subscription_status,
  subscription_period_end timestamptz,
  subscription_cancel_at_period_end boolean default false,
  push_subscription jsonb,                 -- Web Push VAPID subscription
  email_notifications boolean default true,
  push_notifications boolean default true,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Treści (wideo, audio, PDF, posty, live)
create table content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  type content_type not null,
  visibility content_visibility not null default 'public',
  tier_id uuid references tiers(id),       -- wymagane jeśli visibility='supporter'
  excerpt text,
  body_markdown text,                      -- dla postów/artykułów
  video_provider video_provider,
  video_id text,                           -- ID w YouTube/Bunny/Vimeo
  video_signed_url text,                   -- wygenerowane na żądanie (Edge Function)
  thumbnail_url text,
  duration_seconds int,                    -- dla wideo/audio
  file_url text,                           -- dla PDF
  file_size_bytes bigint,
  published_at timestamptz,
  scheduled_at timestamptz,                -- do planowanej publikacji
  is_featured boolean default false,       -- na górze feedu
  view_count bigint default 0,
  meta jsonb default '{}',                 -- dodatkowe pola elastyczne
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Komentarze (Realtime)
create table comments (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references content(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  body text not null,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Logi płatności / zdarzeń (audyt)
create table payment_events (
  id bigserial primary key,
  stripe_event_id text unique not null,
  user_id uuid references profiles(id) on delete set null,
  type payment_event_type not null,
  payload jsonb not null,
  processed_at timestamptz default now()
);

-- Odsyłacze do materiałów (dla analytics / click tracking)
create table content_clicks (
  id bigserial primary key,
  content_id uuid not null references content(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  referrer text,
  clicked_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_profiles_role on profiles(role);
create index idx_profiles_stripe_customer on profiles(stripe_customer_id);
create index idx_profiles_tier on profiles(tier_id);
create index idx_content_visibility on content(visibility);
create index idx_content_tier on content(tier_id);
create index idx_content_published on content(published_at desc) where published_at is not null;
create index idx_content_slug on content(slug);
create index idx_content_type on content(type);
create index idx_comments_content on comments(content_id, created_at desc);
create index idx_comments_user on comments(user_id);
create index idx_payment_events_user on payment_events(user_id);
create index idx_payment_events_stripe on payment_events(stripe_event_id);
create index idx_content_clicks_content on content_clicks(content_id);

-- ============================================
-- TRIGGERS (updated_at)
-- ============================================

create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger update_tiers_updated_at
  before update on tiers for each row execute function update_updated_at_column();

create trigger update_profiles_updated_at
  before update on profiles for each row execute function update_updated_at_column();

create trigger update_content_updated_at
  before update on content for each row execute function update_updated_at_column();

create trigger update_comments_updated_at
  before update on comments for each row execute function update_updated_at_column();