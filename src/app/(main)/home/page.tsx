"use client";

import Link from "next/link";
import BottomNavbar from "@/src/components/layout/BottomNavbar";
import { getCuratedProfiles, type Profile } from "@/src/lib/profiles";
import { useSelection } from "@/src/context/SelectionContext";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { selectedIds, toggleSelection } = useSelection();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCuratedProfiles()
      .then(setProfiles)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load curated profiles."))
      .finally(() => setLoading(false));
  }, []);

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

          <span className="rounded-full bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
            {profiles.length} people
          </span>
        </div>

        {/* Profile grid */}
        {loading && <p className="col-span-full py-12 text-center text-sm text-gray-500">Finding people who fit your type…</p>}
        {error && <p role="alert" className="col-span-full py-12 text-center text-sm text-red-600">{error}</p>}
        {!loading && !error && profiles.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <h2 className="font-semibold">Your curated list is taking shape</h2>
            <p className="mt-2 text-sm text-gray-500">We’ll show people who fit your preferences and are also looking for someone like you.</p>
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
                {/* Profile photo */}
                <button
                  type="button"
                  onClick={() => toggleSelection(profile.id)}
                  aria-pressed={isSelected}
                  aria-label={`${
                    isSelected ? "Deselect" : "Select"
                  } ${profile.name}`}
                  className="relative block w-full text-left"
                >
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="aspect-[3/4] w-full object-cover"
                  />

                  {/* Selection indicator */}
                  <span
                    className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      isSelected
                        ? "bg-rose-500 text-white"
                        : "border-2 border-white bg-black/20 text-white"
                    }`}
                  >
                    {isSelected ? "✓" : "+"}
                  </span>
                </button>

                {/* Profile details */}
                <div className="p-3">
                  <h3 className="font-semibold">
                    {profile.name}, {profile.age}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {[profile.job, profile.city].filter(Boolean).join(" · ")}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                    {profile.introduction}
                  </p>

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
      <BottomNavbar />
    </main>
  );
}
