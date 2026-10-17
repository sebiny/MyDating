"use client";

import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Discover your people",
    description:
      "Explore profiles and discover people who share your interests and personality.",
    href: "/home",
    icon: "♡",
  },
  {
    number: "02",
    title: "Choose your connections",
    description:
      "Select multiple profiles you're interested in and review your choices at your own pace.",
    href: "/selected",
    icon: "✳",
  },
  {
    number: "03",
    title: "Make it mutual",
    description:
      "Manage incoming interests and build connections when the interest is mutual.",
    href: "/interests",
    icon: "↗",
  },
  {
    number: "04",
    title: "Start a conversation",
    description:
      "Move beyond profiles and get to know your matches through meaningful conversations.",
    href: "/chat",
    icon: "☏",
  },
];

const exploreLinks = [
  { label: "Home", href: "/home" },
  { label: "Selected", href: "/selected" },
  { label: "Interests", href: "/interests" },
  { label: "Chat", href: "/chat" },
  { label: "Profile", href: "/profile" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf8] text-[#292321]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-pink-100/80 bg-[#fffaf8]/90 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-pink-600"
          >
            DateMate<span className="text-orange-400">.</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="#features"
              className="text-sm text-gray-600 hover:text-pink-600"
            >
              How it works
            </Link>
            <Link
              href="#about"
              className="text-sm text-gray-600 hover:text-pink-600"
            >
              About
            </Link>
            <Link
              href="/login"
              className="text-sm text-gray-700 hover:text-pink-600"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              Get started
            </Link>
          </div>

          <div className="flex gap-4 md:hidden">
            <Link href="/login" className="py-2 text-sm font-medium">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28 lg:px-10">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700">
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            Dating, with intention.
          </span>

          <h1 className="mt-8 max-w-2xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Less swiping.
            <br />
            <span className="text-pink-600">More meaning.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
            Meet people at your own pace. Discover compatible profiles, choose
            the connections that interest you, and turn mutual interest into
            meaningful conversations.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-pink-600 px-8 py-4 font-semibold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:bg-pink-700"
            >
              Find your connection →
            </Link>

            <Link
              href="/home"
              className="rounded-full border border-gray-200 bg-white px-8 py-4 font-semibold transition hover:border-pink-300 hover:text-pink-600"
            >
              Explore DateMate
            </Link>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            No endless swiping. Just a more thoughtful way to connect.
          </p>
        </div>

        {/* Decorative profile cards */}
        <div className="relative mx-auto flex min-h-[400px] w-full max-w-lg items-center justify-center sm:min-h-[480px]">
          <div className="absolute h-72 w-72 rounded-full bg-pink-200/60 blur-3xl sm:h-96 sm:w-96" />

          <div className="absolute left-3 top-10 w-44 rotate-[-10deg] rounded-3xl border border-white bg-white p-4 shadow-xl sm:left-5 sm:w-52">
            <div className="flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-pink-200 text-6xl sm:h-48">
              ☀️
            </div>
            <p className="mt-4 font-bold">Your kind of person</p>
            <p className="mt-1 text-xs text-gray-500">
              Shared interests, real connection.
            </p>
          </div>

          <div className="absolute right-2 top-6 w-44 rotate-[9deg] rounded-3xl border border-white bg-white p-4 shadow-xl sm:right-4 sm:w-52">
            <div className="flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-200 text-6xl sm:h-48">
              🌷
            </div>
            <p className="mt-4 font-bold">A little more you</p>
            <p className="mt-1 text-xs text-gray-500">
              Get to know each other naturally.
            </p>
          </div>

          <div className="absolute bottom-7 left-1/2 z-10 w-64 -translate-x-1/2 rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-2xl sm:w-72">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-2xl">
                ♡
              </div>
              <div>
                <p className="font-bold">A connection worth choosing</p>
                <p className="mt-1 text-xs text-gray-500">
                  Start with mutual interest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
              A better way to connect
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Your connections, your way.
            </h2>
            <p className="mt-5 leading-7 text-gray-600">
              From discovering new people to starting your first conversation,
              every step is designed to feel more intentional.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link
                key={feature.number}
                href={feature.href}
                className="group rounded-3xl border border-gray-100 bg-[#fffaf8] p-7 transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-pink-500">
                    {feature.number}
                  </span>
                  <span className="text-3xl text-pink-500 transition group-hover:scale-110">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
                <span className="mt-6 inline-block text-sm font-semibold text-pink-600">
                  Explore feature →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2rem] bg-gradient-to-br from-pink-100 via-rose-50 to-orange-100 p-8 sm:p-12 md:grid-cols-2 lg:p-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-700">
              It starts with a choice
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Connection is more than a swipe.
            </h2>
          </div>
          <div>
            <p className="leading-8 text-gray-700">
              DateMate puts you in control. Build your profile, explore people
              who fit your preferences, select the profiles that catch your
              attention, and connect when the interest is mutual.
            </p>
            <Link
              href="/signup"
              className="mt-7 inline-flex rounded-full bg-pink-600 px-7 py-3.5 font-semibold text-white transition hover:bg-pink-700"
            >
              Start your journey →
            </Link>
          </div>
        </div>
      </section>

      {/* Developer navigation */}
      <section className="border-t border-pink-100 bg-white px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-lg font-bold">Explore DateMate</h2>
          <p className="mt-2 text-sm text-gray-500">
            Quick links to the pages you're building.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {exploreLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-700 transition hover:border-pink-300 hover:text-pink-600"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/profile-setup"
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-700 transition hover:border-pink-300 hover:text-pink-600"
            >
              Profile Setup
            </Link>
            <Link
              href="/profile-setup/introduce"
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-700 transition hover:border-pink-300 hover:text-pink-600"
            >
              Introduction
            </Link>
            <Link
              href="/profile-setup/type"
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-700 transition hover:border-pink-300 hover:text-pink-600"
            >
              Personality Type
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-100 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="text-xl font-black text-pink-600">
            DateMate<span className="text-orange-400">.</span>
          </Link>
          <p className="text-center text-sm text-gray-500">
            Make room for meaningful connections.
          </p>
          <div className="flex gap-5 text-sm text-gray-600">
            <Link href="/signup" className="hover:text-pink-600">
              Sign up
            </Link>
            <Link href="/login" className="hover:text-pink-600">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
