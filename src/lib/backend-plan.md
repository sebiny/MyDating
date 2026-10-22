# MyDating backend setup

The app uses Supabase for authentication, PostgreSQL, Storage, and Realtime. It does not need Prisma or a separate WebSocket server: Realtime streams database changes over WebSockets while PostgreSQL stores the durable records.

## Required environment

Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and the Vercel project environment. Never expose a service role key in browser code. The migration creates a public `avatars` storage bucket with owner-scoped upload policies.

## Data model

Apply the SQL migration in `supabase/migrations/0001_curated_dating.sql` to the Supabase project. It creates profiles, selections, interests, matches, conversations, messages, and notifications with RLS. Discovery filters by reciprocal age and gender preferences, then ranks by shared interests and personality answers.

## Account setup

The Supabase browser and server clients use `@supabase/ssr`. Email verification must be enabled in Supabase Auth, and the local/deployed `/auth/callback` URLs must be added to the allowed redirect list. Apply the SQL migration before trying the app flows.
