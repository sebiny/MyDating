"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSelectedProfiles, type Profile } from "@/src/lib/profiles";
import { createClient } from "@/src/lib/supabase/browser";

type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string };

export default function IndividualChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState("");
  const [person, setPerson] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const { data: conversation, error: conversationError } = await supabase.from("conversations")
        .select("id,match_id").eq("id", conversationId).single();
      if (conversationError) throw new Error("This conversation is unavailable.");
      const { data: match, error: matchError } = await supabase.from("matches")
        .select("user_one,user_two").eq("id", conversation.match_id).single();
      if (matchError) throw matchError;
      const otherUserId = match.user_one === user.id ? match.user_two : match.user_one;
      if (match.user_one !== user.id && match.user_two !== user.id) throw new Error("You are not part of this conversation.");
      const [profiles, messageResult] = await Promise.all([
        getSelectedProfiles([otherUserId]),
        supabase.from("messages").select("id,conversation_id,sender_id,body,created_at")
          .eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(500),
      ]);
      if (messageResult.error) throw messageResult.error;
      setCurrentUserId(user.id);
      setPerson(profiles[0] ?? null);
      setMessages(messageResult.data ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load this conversation.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadConversation();
    let supabase: ReturnType<typeof createClient>;
    try { supabase = createClient(); } catch { return; }
    const channel = supabase.channel(`conversation-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload: { new: Message }) => {
        // Realtime delivers the inserted row; avoid duplicates if the sender already added it locally.
        const message = payload.new as Message;
        setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [conversationId, loadConversation]);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = input.trim();
    if (!body || !currentUserId || sending) return;
    setSending(true);
    setError("");
    const supabase = createClient();
    const { data, error: sendError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body,
    }).select("id,conversation_id,sender_id,body,created_at").single();
    if (sendError) {
      setError(sendError.message);
    } else if (data) {
      setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data]);
      setInput("");
    }
    setSending(false);
  }

  if (loading) return <main className="p-8 text-center text-gray-500">Loading chat…</main>;
  if (error && !person) return <main className="p-8 text-center"><p role="alert" className="text-red-600">{error}</p><button onClick={() => router.back()} className="mt-4 text-rose-600">Go back</button></main>;
  if (!person) return <main className="p-8 text-center">Conversation unavailable.</main>;

  return (
    <main className="flex h-dvh flex-col bg-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button type="button" onClick={() => router.push("/chat")} aria-label="Back to conversations" className="rounded-full px-2 py-1 text-2xl text-rose-500 hover:bg-rose-50">←</button>
        {/* eslint-disable-next-line @next/next/no-img-element */}<img src={person.image} alt="" className="h-12 w-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1"><h1 className="truncate font-bold text-gray-900">{person.name}</h1><p className="text-sm text-green-600">Matched</p></div>
      </header>

      {error && <p role="alert" className="bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <section aria-label="Conversation messages" className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-6">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-gray-500">You matched. Say hello and start a conversation.</p>}
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;
          return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${mine ? "rounded-br-sm bg-rose-500 text-white" : "rounded-bl-sm bg-white text-gray-800 shadow-sm"}`}>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 sm:text-base">{message.body}</p>
              <time className={`mt-1 block text-right text-xs ${mine ? "text-rose-100" : "text-gray-400"}`}>{new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
            </div>
          </div>;
        })}
        <div ref={bottomRef} />
      </section>

      <form onSubmit={(event) => void handleSend(event)} className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-3 py-3 sm:px-4">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type a message…" aria-label="Type a message" maxLength={5000} className="min-w-0 flex-1 rounded-full bg-gray-100 px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 sm:text-base" />
        <button type="submit" disabled={!input.trim() || sending} aria-label="Send message" className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-xl text-white hover:bg-rose-600 disabled:opacity-40">↑</button>
      </form>
    </main>
  );
}
