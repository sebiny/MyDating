# MyDating backend setup

The app uses Supabase for authentication, PostgreSQL, Storage, and Realtime. It does not need Prisma or a separate WebSocket server: Realtime streams database changes over WebSockets while PostgreSQL stores the durable records.

## Required environment

Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and the Vercel project environment. Never expose a service role key in browser code. The migration creates a public `avatars` storage bucket with owner-scoped upload policies.

## Data model

Apply the SQL migration in `supabase/migrations/0001_curated_dating.sql` to the Supabase project. It creates profiles, selections, interests, matches, conversations, messages, and notifications with RLS. Discovery filters by reciprocal age and gender preferences, then ranks by shared interests and personality answers.

## Account setup

The Supabase browser and server clients use `@supabase/ssr`. Email verification must be enabled in Supabase Auth, and the local/deployed `/auth/callback` URLs must be added to the allowed redirect list. Apply the SQL migrations before trying the app flows.

## Email delivery for real users

The app code requests verification messages through Supabase Auth. It does not send email itself. Supabase's built-in sender is intended for development and has low send limits and recipient restrictions, so public signups need a custom SMTP provider.

1. Create an account with an SMTP email provider (for example, Resend or Amazon SES) and verify a domain you own with that provider.
2. In Supabase, open **Authentication → Emails → SMTP Settings** (the menu label may vary) and enable custom SMTP.
3. Copy the provider's SMTP host, port, username, password, and verified sender address into the Supabase SMTP settings. These are private credentials: keep them in Supabase, never in `NEXT_PUBLIC_*` variables, browser code, or Git.
4. In **Authentication → URL Configuration**, set the deployed app as the Site URL and allow the exact deployed `/auth/callback` URL. Keep `http://localhost:3000/auth/callback` for local development.
5. Send one test signup and inspect Supabase Auth logs plus the provider's delivery log if the email does not arrive.

Changing application code cannot raise Supabase's email quota. The code now translates common email-rate-limit and unauthorized-recipient responses into clearer signup messages; the SMTP provider must still be configured in the Supabase dashboard.
