MyDating 

A modern dating platform built with Next.js, TypeScript, Tailwind CSS, and Supabase, designed to help people discover compatible profiles, select multiple people, express interest, and build meaningful connections.

### Current dating app

swipe-left/swipe-right model. It’s more like curated dating: users discover people, select multiple people they’re interested in, confirm their choices, and then decide whether to message them.

### My dating app structure

The biggest difference: the homepage should only show people who have been selected or approved according to your matching rules, rather than every registered user.

✨ Features

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

📁 Project Structure
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

🔄 User Flow
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

🗺️ Planned Development
* [ ]	Implement authentication and email verification
* [ ]	Create profile setup and editing
* [ ]	Build personality questionnaire
* [ ]	Implement matching and notifications
* [ ]	Build real-time messaging
* [ ]	Deploy the application

⸻

Built with ❤️ using Next.js and Supabase.
