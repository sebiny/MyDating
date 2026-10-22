### MyDating 

A CURATED DATING APP : users can discover selected people they’re interested in instead of doing endless swiping to find your type! This will help you find your ideal type in a more efficient way.

### Current dating app

swipe-left/swipe-right model. It’s more like curated dating: users discover people, select multiple people they’re interested in, confirm their choices, and then decide whether to message them.

### My dating app structure

The biggest difference: the homepage should only show people who have been selected or approved according to your matching rules, rather than every registered user.


### To see more
notion: https://app.notion.com/p/My-Dating-8831387f773783e884af013fbb3ba6a0

deploy:https://my-dating-eight.vercel.app/

### ✨ Features

🔐 Authentication
* User sign-up and login
* Email verification
* Secure authentication with Supabase
* Guided onboarding for new users

👤 Profile Setup
* Upload profile photos
* Add a personal introduction and bio
* Share job, nationality, hobbies, and interests
* Complete a personality and compatibility questionnaire
* Set dating preferences
       
<img width="250" height="250" alt="KakaoTalk_20261016_150229783_02" src="https://github.com/user-attachments/assets/af5bc3f6-f0e8-4172-926f-d667aa5b6fd4" />

<img width="250" height="280" alt="KakaoTalk_20261016_150229783_01" src="https://github.com/user-attachments/assets/0b78086c-79c4-457a-9503-22ff8dca6386" />
</div>

🏠 Home — Discover
* Browse compatible people in a responsive profile grid
* View profile photos and personal information
* Select multiple profiles
* Explore more profiles by scrolling
* Discover people based on preferences and compatibility

📋 Selected People
* Review selected profiles on a separate page
* Sort and manage selections
* Remove people from the selection list
* Confirm selections before taking action
* Send interest or message requests

💌 Interests & Matching
* View people who have expressed interest
* Accept or decline incoming interest
* Notify users when their interest is accepted
* Create mutual connections based on matching rules
  
<img width="250" height="280" alt="KakaoTalk_20261016_150229783_03" src="https://github.com/user-attachments/assets/3babd0a8-5dee-441d-a3f3-b897d226f4ac" />

💬 Chat
* View conversations
* Send and receive messages
* Organize conversations with matched users or approved contacts

👥 Profile Management
* View and edit personal information
* Update photos, bio, hobbies, and other details
* Manage dating preferences

🛠️ Tech Stack
Technology	Purpose
Next.js App Router	Application framework and routing
React	User interface
TypeScript	Type safety
Tailwind CSS	Styling and responsive design
Supabase Auth	Authentication and sessions
Supabase PostgreSQL	Database and profile storage
Supabase Storage	Profile photo uploads

## 📁 Project Structure

```text
my-dating-app/
├── public/
│   ├── images/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signup/
│   │   │   └── login/
│   │   ├── (onboarding)/
│   │   │   └── profile-setup/
│   │   │       └── type/
│   │   └── (main)/
│   │       ├── home/
│   │       ├── selected/
│   │       ├── interests/
│   │       ├── chat/
│   │       └── profile/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── profile/
│   │   ├── matching/
│   │   └── chat/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   │   └── supabase/
│   └── types/
├── supabase/
│   └── migrations/
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 User Flow

```text
Sign Up / Login
       ↓
Profile Setup
       ↓
Personality Questionnaire
       ↓
Home — Discover Compatible People
       ↓
Select Multiple Profiles
       ↓
Selected — Review & Sort
       ↓
Confirm Interest or Message Request
       ↓
Incoming Interest / Mutual Match
       ↓
Chat
```

🗺️ Development status
* [x] Supabase email sign-up/sign-in with email verification callback
* [x] Profile and preference onboarding with photo uploads
* [x] Reciprocal curated discovery and persistent selections
* [x] Incoming/outgoing interests with approval-based matches
* [x] Persistent realtime chat and in-app notifications
* [ ] Configure the Supabase project, apply migrations, and add production keys
* [ ] Configure Supabase email verification redirects and deploy the updated app

## Supabase setup

This app uses Supabase Auth, PostgreSQL, Storage, and Realtime. Set "NEXT_PUBLIC_SUPABASE_URL" and "NEXT_PUBLIC_SUPABASE_ANON_KEY" in .env.local and in your Vercel project settings. Never use the service role key in browser code.

Apply "supabase/migrations/0001_curated_dating.sql" to your Supabase project. It creates profile, selection, interest, match, conversation, message, and notification tables with row-level security. Email verification must be enabled in Supabase Auth, with "https://YOUR_DOMAIN/auth/callback" and "http://localhost:3000/auth/callback" added as allowed redirect URLs.

Curated discovery uses reciprocal gender and age preferences. A user appears only when both profiles are complete, visible, and in each other's preference range. A chat becomes available only after an incoming interest is accepted. Messages are stored in PostgreSQL and delivered live through Supabase Realtime; each new message creates an in-app notification.

### Current feature status
- [x] Supabase email sign-up/sign-in and auth callback
- [x] Profile and preference onboarding, photo uploads, and database persistence
- [x] Reciprocal curated discovery and database-backed selections
- [x] Incoming/outgoing interests and approval-based matches
- [x] Persisted realtime chat and in-app notifications
- [ ] Add Supabase project keys and apply the migration
- [ ] Configure Supabase email verification and production redirect URLs

Selections are persisted server-side. Onboarding uses temporary browser storage between the profile, introduction, and preference steps, then clears those temporary values after saving the completed profile.

