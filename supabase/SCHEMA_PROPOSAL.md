# TravelGenious Supabase Schema Proposal

This schema is designed for a client-safe Expo app using Supabase Auth with Row Level Security enabled on all app tables.

## Tables

### `profiles`
- One row per authenticated user.
- Stores primary account metadata used by the profile screen and personalization.
- Primary key is `auth.users.id`.

### `travel_preferences`
- One row per user.
- Stores preference signals used by Heia and future recommendation flows.
- Includes budget, luxury level, visa preference, weather preference, party composition, and preferred trip types.

### `saved_trips`
- User-owned trip records for planning, confirmed itineraries, or wishlists.
- Supports CRUD from the mobile app.

### `saved_destinations`
- User-owned saved destinations, optionally linked to a package ID from the catalog.
- Uses `destination_slug` for stable deduplication.

### `ai_chat_threads`
- Conversation containers for Heia chat sessions.
- Stores locale, preview text, and recency metadata.

### `ai_chat_messages`
- Message log for each Heia thread.
- Stores the full UI payload as `jsonb` so the app can rehydrate structured assistant messages later.

### `notification_metadata`
- User-owned notification state, not the full inbox feed.
- Tracks unread counts, last-opened timestamps, mute windows, and channel/category metadata.

### `offer_bookmarks`
- User-owned bookmarks for featured offers and packages.

## Security Model

- All tables have RLS enabled.
- Authenticated users can only read and write their own rows.
- `profiles.id` is tied directly to `auth.uid()`.
- A trigger creates a base `profiles` row and `travel_preferences` row when a new auth user signs up.

## Files

- Full schema snapshot: [schema.sql](/home/bluewolf/Desktop/Rand_Project/supabase/schema.sql)
- Initial migration: [20260327090000_initial_travelgenious.sql](/home/bluewolf/Desktop/Rand_Project/supabase/migrations/20260327090000_initial_travelgenious.sql)
