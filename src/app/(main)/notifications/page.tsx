"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNavbar from "@/src/components/layout/BottomNavbar";
import { createClient } from "@/src/lib/supabase/browser";

type Notification = { id: string; kind: "interest" | "match" | "message"; entity_id: string | null; body: string; created_at: string; read_at: string | null };

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error: queryError } = await supabase.from("notifications")
        .select("id,kind,entity_id,body,created_at,read_at")
        .order("created_at", { ascending: false }).limit(100);
      if (queryError) setError(queryError.message);
      else setItems(((data ?? []) as Notification[]));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Supabase is not configured.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    let supabase: ReturnType<typeof createClient>;
    try { supabase = createClient(); } catch { return; }
    let channel: ReturnType<typeof supabase.channel> | undefined;
    // The callback only needs the user's ID to scope the notification subscription.
    void supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
      if (!data.user) return;
      channel = supabase.channel(`notifications-${data.user.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${data.user.id}` }, () => void load())
        .subscribe();
    });
    return () => { if (channel) void supabase.removeChannel(channel); };
  }, [load]);

  async function open(item: Notification) {
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", item.id);
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
    if (item.kind === "interest") { router.push("/interests"); return; }
    if (item.kind === "match" && item.entity_id) {
      const { data } = await supabase.from("conversations").select("id").eq("match_id", item.entity_id).maybeSingle();
      if (data) { router.push(`/chat/${data.id}`); return; }
    }
    if (item.kind === "message" && item.entity_id) {
      const { data } = await supabase.from("messages").select("conversation_id").eq("id", item.entity_id).maybeSingle();
      if (data) { router.push(`/chat/${data.conversation_id}`); return; }
    }
    router.push("/chat");
  }

  return (
    <main className="min-h-screen bg-[#faf8f6] px-4 py-8 pb-36 text-gray-900 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7"><p className="text-sm font-medium text-rose-500">YOUR UPDATES</p><h1 className="mt-2 text-3xl font-bold">Notifications</h1><p className="mt-2 text-sm text-gray-500">Interests, matches, and new messages.</p></header>
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {loading ? <p className="py-12 text-center text-gray-500">Loading updates…</p> : items.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center"><span className="text-4xl">♡</span><h2 className="mt-3 font-semibold">You’re all caught up</h2><p className="mt-2 text-sm text-gray-500">We’ll let you know when someone connects with you.</p></div>
        ) : (
          <ul className="divide-y rounded-2xl bg-white px-5 shadow-sm">
            {items.map((item) => <li key={item.id}><button type="button" onClick={() => void open(item)} className={`flex w-full items-start gap-3 py-5 text-left ${item.read_at ? "" : "font-semibold"}`}>
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xl">{item.kind === "interest" ? "♡" : item.kind === "match" ? "💞" : "✉"}</span>
              <span className="min-w-0 flex-1"><span className="block text-sm text-gray-800">{item.body}</span><time className="mt-1 block text-xs font-normal text-gray-400">{new Date(item.created_at).toLocaleString()}</time></span>
              {!item.read_at && <span className="mt-3 h-2 w-2 rounded-full bg-rose-500" aria-label="Unread" />}
            </button></li>)}
          </ul>
        )}
      </div>
      <BottomNavbar />
    </main>
  );
}
