"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNavbar from "@/src/components/layout/BottomNavbar";
import { getSelectedProfiles, type Profile } from "@/src/lib/profiles";
import { useSelection } from "@/src/context/SelectionContext";
import { createClient } from "@/src/lib/supabase/browser";

export default function SelectedPage() {
  const router = useRouter();
  const { selectedIds, removeSelection, clearSelection } = useSelection();
  const [people, setPeople] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSelectedProfiles(selectedIds)
      .then(setPeople)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load your selection."))
      .finally(() => setLoading(false));
  }, [selectedIds]);

  async function sendInterests() {
    setError("");
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again to continue.");
      if (!selectedIds.length) return;
      const { error: insertError } = await supabase.from("interests").insert(
        selectedIds.map((recipient_id) => ({ sender_id: user.id, recipient_id })),
      );
      if (insertError) throw insertError;
      await clearSelection();
      router.push("/interests");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send your interests. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f6] pb-36 text-gray-900">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <header className="mb-8">
          <Link href="/home" className="text-sm text-gray-500 hover:text-rose-500">← Back to Discover</Link>
          <p className="mt-6 text-sm font-medium text-rose-500">YOUR COLLECTION</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Your selected people.</h1>
          <p className="mt-2 text-sm text-gray-500">Review your choices, then send an interest to each person.</p>
        </header>

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Selected people</h2>
          <span className="rounded-full bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">{people.length} selected</span>
        </div>

        {loading && <p className="py-12 text-center text-sm text-gray-500">Loading your selection…</p>}
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!loading && people.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <div className="mb-4 text-4xl">♡</div>
            <h2 className="text-lg font-semibold">No one selected yet</h2>
            <p className="mt-2 text-sm text-gray-500">Discover people who fit your preferences and select the ones you like.</p>
            <Link href="/home" className="mt-6 inline-flex rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600">Discover people</Link>
          </div>
        )}

        {people.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {people.map((person) => (
                <article key={person.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={person.image} alt={person.name} className="aspect-[3/4] w-full object-cover" />
                  <div className="p-3">
                    <h3 className="font-semibold">{person.name}, {person.age}</h3>
                    <p className="mt-1 text-xs font-medium text-rose-500">{[person.job, person.city].filter(Boolean).join(" · ")}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">{person.introduction}</p>
                    <button type="button" onClick={() => void removeSelection(person.id)} className="mt-3 w-full rounded-xl bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200">Remove</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button type="button" disabled={sending} onClick={() => void sendInterests()} className="rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50">
                {sending ? "Sending…" : `Send interest to ${people.length} ${people.length === 1 ? "person" : "people"}`}
              </button>
            </div>
          </>
        )}
      </div>
      <BottomNavbar />
    </main>
  );
}
