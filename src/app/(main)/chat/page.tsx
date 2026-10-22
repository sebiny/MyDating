"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNavbar from "@/src/components/layout/BottomNavbar";
import { getSelectedProfiles, type Profile } from "@/src/lib/profiles";
import { createClient } from "@/src/lib/supabase/browser";

type ChatItem = { conversationId: string; person: Profile; preview: string; sentAt: string | null };

export default function ChatPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChats = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const { data: matches, error: matchError } = await supabase.from("matches")
        .select("id,user_one,user_two,created_at")
        .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (matchError) throw matchError;
      // Supabase queries are not generated from database types here, so describe the selected columns.
      const matchRows = (matches ?? []) as { id: string; user_one: string; user_two: string; created_at: string }[];
      const matchIds = matchRows.map((match) => match.id);
      if (!matchIds.length) { setChats([]); return; }
      const { data: conversations, error: conversationError } = await supabase.from("conversations").select("id,match_id").in("match_id", matchIds);
      if (conversationError) throw conversationError;
      // Keep only fields requested above; these rows connect a match to its chat.
      const conversationRows = (conversations ?? []) as { id: string; match_id: string }[];
      const conversationIds = conversationRows.map((conversation) => conversation.id);
      const { data: messages, error: messageError } = conversationIds.length
        ? await supabase.from("messages").select("conversation_id,body,created_at").in("conversation_id", conversationIds).order("created_at", { ascending: false }).limit(500)
        : { data: [], error: null };
      if (messageError) throw messageError;
      const messageRows = (messages ?? []) as { conversation_id: string; body: string; created_at: string }[];
      const conversationByMatch = new Map(conversationRows.map((conversation) => [conversation.match_id, conversation]));
      const targets = matchRows.flatMap((match) => {
        const conversation = conversationByMatch.get(match.id);
        return conversation ? [{ conversationId: conversation.id, profileId: match.user_one === user.id ? match.user_two : match.user_one }] : [];
      });
      const people = await getSelectedProfiles(targets.map((target) => target.profileId));
      const byId = new Map(people.map((person) => [person.id, person]));
      const latestByConversation = new Map<string, { body: string; created_at: string }>();
      for (const message of messageRows) {
        if (!latestByConversation.has(message.conversation_id)) latestByConversation.set(message.conversation_id, message);
      }
      setChats(targets.flatMap(({ conversationId, profileId }) => {
        const person = byId.get(profileId);
        if (!person) return [];
        const latest = latestByConversation.get(conversationId);
        return [{ conversationId, person, preview: latest?.body ?? "You matched! Say hello.", sentAt: latest?.created_at ?? null }];
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChats();
    let supabase: ReturnType<typeof createClient>;
    try { supabase = createClient(); } catch { return; }
    const channel = supabase.channel("chat-list-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => void loadChats())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadChats]);

  return (
    <main className="min-h-screen bg-gray-50 pb-36">
      <header className="border-b bg-white p-5"><h1 className="text-2xl font-bold">Messages</h1><p className="mt-1 text-sm text-gray-500">Chats open after both people connect.</p></header>
      {error && <p role="alert" className="m-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <p className="p-8 text-center text-gray-500">Loading conversations…</p> : chats.length ? (
        <section className="divide-y bg-white">
          {chats.map(({ conversationId, person, preview, sentAt }) => (
            <button key={conversationId} type="button" onClick={() => router.push(`/chat/${conversationId}`)} className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={person.image} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div className="min-w-0 flex-1"><h2 className="font-semibold">{person.name}</h2><p className="truncate text-sm text-gray-500">{preview}</p></div>
              <time className="text-xs text-gray-400">{sentAt ? new Date(sentAt).toLocaleDateString() : ""}</time>
            </button>
          ))}
        </section>
      ) : (
        <div className="p-10 text-center"><p className="font-medium text-gray-700">No conversations yet.</p><p className="mt-2 text-sm text-gray-500">When you accept an interest, your private chat will appear here.</p></div>
      )}
      <BottomNavbar />
    </main>
  );
}
