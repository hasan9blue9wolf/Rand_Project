create extension if not exists pgcrypto;

create type public.trip_status as enum ('confirmed', 'planning', 'wishlist');
create type public.trip_type as enum (
  'adventure',
  'business',
  'couples',
  'family',
  'friends',
  'luxury',
  'solo',
  'wellness'
);
create type public.luxury_level as enum ('comfort', 'luxury', 'premium', 'ultraLuxury');
create type public.budget_level as enum ('luxury', 'premium', 'smart');
create type public.visa_preference as enum ('easyVisa', 'flexible', 'visaFreeOnly');
create type public.weather_preference as enum ('cool', 'mild', 'snow', 'warm');
create type public.notification_channel as enum ('email', 'in_app', 'push');
create type public.notification_category as enum (
  'booking',
  'heia',
  'marketing',
  'price_alert'
);
create type public.ai_message_role as enum ('assistant', 'system', 'user');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'ar')),
  home_airport text,
  departure_city text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.travel_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  budget_level public.budget_level,
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  luxury_level public.luxury_level,
  visa_preference public.visa_preference,
  weather_preference public.weather_preference,
  preferred_trip_types public.trip_type[] not null default '{}'::public.trip_type[],
  preferred_vibes text[] not null default '{}'::text[],
  adults integer,
  children integer,
  infants integer,
  seat_class text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  destination text not null,
  departure_city text,
  start_date date not null,
  end_date date not null,
  travelers integer not null default 1 check (travelers > 0),
  status public.trip_status not null default 'planning',
  progress_label text,
  budget_min numeric(12, 2),
  budget_max numeric(12, 2),
  trip_type public.trip_type,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.saved_destinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  destination_name text not null,
  destination_slug text not null,
  country_name text,
  package_id text,
  image_url text,
  summary text,
  price_from numeric(12, 2),
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint saved_destinations_user_slug_key unique (user_id, destination_slug)
);

create table if not exists public.ai_chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  last_message_preview text,
  last_message_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_chat_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.ai_message_role not null,
  message_kind text not null,
  message_payload jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notification_metadata (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel public.notification_channel not null,
  category public.notification_category not null,
  unread_count integer not null default 0,
  last_opened_at timestamptz,
  last_received_at timestamptz,
  muted_until timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint notification_metadata_user_channel_category_key unique (user_id, channel, category)
);

create table if not exists public.offer_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  offer_id text not null,
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint offer_bookmarks_user_offer_key unique (user_id, offer_id)
);

create index if not exists saved_trips_user_id_start_date_idx
  on public.saved_trips (user_id, start_date);

create index if not exists saved_destinations_user_id_created_at_idx
  on public.saved_destinations (user_id, created_at desc);

create index if not exists ai_chat_messages_thread_id_created_at_idx
  on public.ai_chat_messages (thread_id, created_at);

create index if not exists ai_chat_threads_user_id_last_message_at_idx
  on public.ai_chat_threads (user_id, last_message_at desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger travel_preferences_set_updated_at
before update on public.travel_preferences
for each row execute function public.set_updated_at();

create trigger saved_trips_set_updated_at
before update on public.saved_trips
for each row execute function public.set_updated_at();

create trigger saved_destinations_set_updated_at
before update on public.saved_destinations
for each row execute function public.set_updated_at();

create trigger ai_chat_threads_set_updated_at
before update on public.ai_chat_threads
for each row execute function public.set_updated_at();

create trigger notification_metadata_set_updated_at
before update on public.notification_metadata
for each row execute function public.set_updated_at();

create trigger offer_bookmarks_set_updated_at
before update on public.offer_bookmarks
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    preferred_locale
  )
  values (
    new.id,
    coalesce(new.email, new.id::text || '@hayatrips.local'),
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'preferred_locale', ''), 'en')
  )
  on conflict (id) do nothing;

  insert into public.travel_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.travel_preferences enable row level security;
alter table public.saved_trips enable row level security;
alter table public.saved_destinations enable row level security;
alter table public.ai_chat_threads enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.notification_metadata enable row level security;
alter table public.offer_bookmarks enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "travel_preferences_manage_own"
on public.travel_preferences
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "saved_trips_manage_own"
on public.saved_trips
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "saved_destinations_manage_own"
on public.saved_destinations
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "ai_chat_threads_manage_own"
on public.ai_chat_threads
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "ai_chat_messages_manage_own"
on public.ai_chat_messages
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notification_metadata_manage_own"
on public.notification_metadata
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "offer_bookmarks_manage_own"
on public.offer_bookmarks
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
