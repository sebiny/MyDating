"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import BottomNavbar from "@/src/components/layout/BottomNavbar";
import { getSelectedProfiles, type Profile } from "@/src/lib/profiles";
import { createClient } from "@/src/lib/supabase/browser";

type IncomingInterest = { id: string; sender_id: string; created_at: string };
type IncomingCard = IncomingInterest & { person: Profile };

export default function InterestsPage() {
  const [incoming, setIncoming] = useState<IncomingCard[]>([]);
  const [outgoing, setOutgoing] = useState<{ id: string; recipient_id: string; status: string; person: Profile }[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadInterests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const [{ data: received, error: receivedError }, { data: sent, error: sentError }] = await Promise.all([
        supabase.from("interests").select("id,sender_id,created_at").eq("recipient_id", user.id).eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("interests").select("id,recipient_id,status").eq("sender_id", user.id).in("status", ["pending", "accepted"]),
      ]);
      if (receivedError) throw receivedError;
      if (sentError) throw sentError;

      // Explicit row shapes keep these Supabase query results type-safe in the UI mapping below.
      const receivedRows = (received ?? []) as IncomingInterest[];
      const sentRows = (sent ?? []) as { id: string; recipient_id: string; status: string }[];
      const ids = [...new Set([...receivedRows.map((item) => item.sender_id), ...sentRows.map((item) => item.recipient_id)])];
      const profiles = await getSelectedProfiles(ids);
      const byId = new Map(profiles.map((person) => [person.id, person]));
      setIncoming(receivedRows.flatMap((interest) => {
        const person = byId.get(interest.sender_id);
        return person ? [{ ...interest, person }] : [];
      }));
      setOutgoing(sentRows.flatMap((interest) => {
        const person = byId.get(interest.recipient_id);
        return person ? [{ ...interest, person }] : [];
      }));

      const incomingIds = receivedRows.map((interest) => interest.id);
      if (incomingIds.length) {
        await supabase.from("notifications").update({ read_at: new Date().toISOString() })
          .eq("user_id", user.id).eq("kind", "interest").in("entity_id", incomingIds).is("read_at", null);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load interests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadInterests(); }, [loadInterests]);

  async function respond(id: string, accept: boolean) {
    setWorkingId(id);
    setError("");
    try {
      const supabase = createClient();
      const { data: matchId, error: responseError } = await supabase.rpc("respond_to_interest", {
        interest_id: id,
        accept,
      });
      if (responseError) throw responseError;
      setIncoming((current) => current.filter((interest) => interest.id !== id));
      if (accept && matchId) {
        const { data: conversation, error: conversationError } = await supabase.from("conversations").select("id").eq("match_id", matchId).single();
        if (conversationError) throw conversationError;
        window.location.assign(`/chat/${conversation.id}`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not respond to this interest.");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8fa] px-4 py-10 pb-36 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-wide text-pink-500">SOMEONE LIKES YOU ♡</p>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Interests & connections</h1>
          <p className="mt-3 text-gray-500">Accept an interest to create a mutual match and open a private chat.</p>
        </header>

        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <section>
          <h2 className="mb-4 text-lg font-semibold">Interested in you <span className="text-sm font-normal text-gray-500">({incoming.length})</span></h2>
          {loading ? <p className="py-10 text-center text-sm text-gray-500">Loading interests…</p> : incoming.length === 0 ? (
            <div className="rounded-3xl border border-pink-100 bg-white px-6 py-12 text-center">
              <div className="mb-4 text-5xl">💌</div><h3 className="font-semibold">No incoming interests yet</h3>
              <p className="mt-2 text-sm text-gray-500">New interests from people in your curated pool will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {incoming.map(({ id, person, created_at }) => (
                <article key={id} className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src={person.image} alt={person.name} className="aspect-[4/3] w-full object-cover" />
                  <div className="p-5"><h3 className="text-xl font-bold">{person.name}, {person.age}</h3>
                    <p className="mt-1 text-xs text-gray-400">{new Date(created_at).toLocaleDateString()}</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{person.introduction}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button disabled={workingId === id} onClick={() => void respond(id, false)} className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">Decline</button>
                      <button disabled={workingId === id} onClick={() => void respond(id, true)} className="rounded-xl bg-pink-500 px-3 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-50">{workingId === id ? "Saving…" : "Accept ♡"}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">Your sent interests</h2>
          {outgoing.length === 0 ? <p className="rounded-2xl bg-white p-5 text-sm text-gray-500">No interests sent yet. <Link className="font-semibold text-pink-600" href="/home">Discover people</Link></p> : (
            <ul className="divide-y rounded-2xl bg-white px-5">
              {outgoing.map(({ id, person, status }) => <li key={id} className="flex items-center justify-between gap-3 py-4"><span className="font-medium">{person.name}</span><span className="text-sm capitalize text-gray-500">{status}</span></li>)}
            </ul>
          )}
        </section>
      </div>
      <BottomNavbar />
    </main>
  );
}
