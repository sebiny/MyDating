"use client";

import Link from "next/link";
import BottomNavbar from "@/src/components/layout/BottomNavbar";
import { getCuratedProfilesPage, type Profile } from "@/src/lib/profiles";
import { useSelection } from "@/src/context/SelectionContext";
import { useEffect, useRef, useState } from "react";

const PAGE_COST = 100;
const PAGE_SIZE = 20;

export default function HomePage() {
  const { selectedIds, toggleSelection } = useSelection();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const endOfFeedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCuratedProfilesPage(0)
      .then((page) => {
        setProfiles(page.profiles);
        setCreditBalance(page.balance);
        setHasMore(page.hasMore);
      })
      .catch((cause) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load curated profiles.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const target = endOfFeedRef.current;
    if (!target || !hasMore || loading || unlocking) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowUnlockPrompt(entry.isIntersecting),
      { rootMargin: "180px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, unlocking, profiles.length]);

  useEffect(() => {
    if (!activeProfile) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveProfile(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeProfile]);

  async function unlockNextPage() {
    if (unlocking || !hasMore) return;
    setUnlocking(true);
    setUnlockError("");
    try {
      const nextPage = await getCuratedProfilesPage(pageNumber + 1);
      if (nextPage.insufficientCredits) {
        setCreditBalance(nextPage.balance);
        setUnlockError(
          `You need ${PAGE_COST} credits to reveal the next ${PAGE_SIZE} people.`,
        );
        return;
      }
      setProfiles((current) => [...current, ...nextPage.profiles]);
      setPageNumber(nextPage.page);
      setCreditBalance(nextPage.balance);
      setHasMore(nextPage.hasMore);
      setShowUnlockPrompt(false);
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Could not open the next page.";
      setUnlockError(
        message.includes("INSUFFICIENT_CREDITS")
          ? `You need ${PAGE_COST} credits to reveal the next ${PAGE_SIZE} people.`
          : message,
      );
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f6] pb-36 text-gray-900">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {/* Header */}
        <header className="mb-7">
          <p className="text-sm font-medium text-rose-500">
            YOUR NEXT CONNECTION
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Discover people.
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Find people who share your type.
          </p>
        </header>

        {/* Selection information */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your type</h2>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600">
              {creditBalance} credits
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
              {profiles.length} people
            </span>
          </div>
        </div>

        {!loading && !error && profiles.length > 0 && !hasMore && (
          <p className="mt-8 text-center text-sm text-gray-500">
            You’ve seen everyone available in your curated pool right now.
          </p>
        )}

        {/* Profile grid */}
        {loading && (
          <p className="col-span-full py-12 text-center text-sm text-gray-500">
            Finding people who fit your type…
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="col-span-full py-12 text-center text-sm text-red-600"
          >
            {error}
          </p>
        )}
        {!loading && !error && profiles.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <h2 className="font-semibold">Your curated list is taking shape</h2>
            <p className="mt-2 text-sm text-gray-500">
              We’ll show people who fit your preferences and are also looking
              for someone like you.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {profiles.map((profile) => {
            const isSelected = selectedIds.includes(profile.id);

            return (
              <article
                key={profile.id}
                className={`overflow-hidden rounded-2xl bg-white shadow-sm transition ${
                  isSelected ? "ring-2 ring-rose-400" : "ring-1 ring-gray-100"
                }`}
              >
                <div className="relative">
                  {/* Tapping the photo opens details; selection stays on the separate plus button. */}
                  <button
                    type="button"
                    onClick={() => setActiveProfile(profile)}
                    aria-label={`View ${profile.name}'s profile`}
                    className="block w-full text-left"
                  >
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleSelection(profile.id)}
                    aria-pressed={isSelected}
                    aria-label={`${isSelected ? "Deselect" : "Select"} ${profile.name}`}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold shadow-md transition ${
                      isSelected
                        ? "bg-rose-500 text-white"
                        : "bg-white/95 text-rose-500 hover:bg-white"
                    }`}
                  >
                    {isSelected ? "✓" : "+"}
                  </button>
                </div>

                {/* Profile details */}
                <div className="p-3">
                  <button
                    type="button"
                    onClick={() => setActiveProfile(profile)}
                    className="block w-full text-left"
                  >
                    <h3 className="font-semibold">
                      {profile.name}, {profile.age}
                    </h3>
                    {profile.matchPercent !== undefined && (
                      <p className="mt-1 text-xs font-semibold text-rose-600">
                        {profile.matchPercent}% type match
                      </p>
                    )}

                    <p className="mt-1 text-xs font-medium text-rose-500">
                      {[profile.job, profile.city].filter(Boolean).join(" · ")}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                      {profile.introduction ||
                        "Tap to learn more about this person."}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleSelection(profile.id)}
                    className={`mt-3 w-full rounded-xl py-2 text-sm font-semibold transition ${
                      isSelected
                        ? "bg-rose-100 text-rose-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected ? "Selected ✓" : "Select"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!loading && !error && hasMore && (
          <div ref={endOfFeedRef} className="h-2" aria-hidden="true" />
        )}
        {!loading && !error && hasMore && showUnlockPrompt && (
          <section
            className="mt-6 rounded-2xl border border-rose-100 bg-white p-5 text-center shadow-sm"
            aria-label="Unlock more curated profiles"
          >
            <h2 className="font-semibold">Keep discovering</h2>
            <p className="mt-1 text-sm text-gray-500">
              The next {PAGE_SIZE} people are ranked for your type. Unlock them
              for {PAGE_COST} credits.
            </p>
            {unlockError && (
              <p role="alert" className="mt-3 text-sm text-amber-700">
                {unlockError} You receive 20 free credits each day, up to 100.
              </p>
            )}
            <button
              type="button"
              onClick={() => void unlockNextPage()}
              disabled={unlocking || creditBalance < PAGE_COST}
              className="mt-4 rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {unlocking
                ? "Unlocking…"
                : creditBalance >= PAGE_COST
                  ? `Unlock next ${PAGE_SIZE} · ${PAGE_COST} credits`
                  : "Not enough credits"}
            </button>
            {creditBalance < PAGE_COST && (
              <p className="mt-3 text-xs text-gray-500">
                Your 20 daily credits are added when you visit discovery each
                day, up to a 100-credit maximum.
              </p>
            )}
          </section>
        )}

        {/* Review selection button */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-[76px] left-0 z-40 w-full px-4">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
              <div>
                <p className="font-semibold">{selectedIds.length} selected</p>
                <p className="text-xs text-gray-500">Review your selection</p>
              </div>

              <Link
                href="/selected"
                className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                Continue →
              </Link>
            </div>
          </div>
        )}
      </div>
      {activeProfile && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setActiveProfile(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="discovery-profile-title"
            className="relative grid max-h-[92dvh] w-full max-w-3xl grid-cols-1 grid-rows-[16rem_minmax(0,1fr)] overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2 md:grid-rows-1"
          >
            <button
              type="button"
              onClick={() => setActiveProfile(null)}
              aria-label="Close profile details"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-2xl text-gray-700 shadow transition hover:bg-white"
            >
              ×
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeProfile.image}
              alt={activeProfile.name}
              className="h-full w-full object-cover md:min-h-[500px] mr-0.5"
            />
            <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                    Profile
                  </p>
                  <h2
                    id="discovery-profile-title"
                    className="mt-1 text-2xl font-bold text-gray-900"
                  >
                    {activeProfile.name}, {activeProfile.age}
                  </h2>
                </div>
                {activeProfile.matchPercent !== undefined && (
                  <span className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-bold text-rose-600">
                    {activeProfile.matchPercent}% type match
                  </span>
                )}
              </div>

              {(activeProfile.job || activeProfile.city) && (
                <p className="mt-3 text-sm font-medium text-rose-600">
                  {[activeProfile.job, activeProfile.city]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-gray-900">
                  A little about me
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {activeProfile.introduction ||
                    "They haven’t added an introduction yet."}
                </p>
              </div>

              {!!activeProfile.interests?.length && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900">Interests</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeProfile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-rose-50 px-3 py-1.5 text-sm text-rose-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  void toggleSelection(activeProfile.id);
                  setActiveProfile(null);
                }}
                className={`mt-8 w-full rounded-xl py-3.5 text-sm font-semibold transition ${
                  selectedIds.includes(activeProfile.id)
                    ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                    : "bg-rose-500 text-white hover:bg-rose-600"
                }`}
              >
                {selectedIds.includes(activeProfile.id)
                  ? "Selected ✓"
                  : "Select this person +"}
              </button>
            </div>
          </section>
        </div>
      )}
      <BottomNavbar />
    </main>
  );
}
