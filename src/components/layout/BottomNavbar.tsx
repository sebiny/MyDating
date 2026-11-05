"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/browser";

const navItems = [
  { label: "Home", href: "/home", icon: "⌂" },
  { label: "Interests", href: "/interests", icon: "♡" },
  { label: "Updates", href: "/notifications", icon: "♧" },
  { label: "Chat", href: "/chat", icon: "♡" },
  { label: "Profile", href: "/profile", icon: "○" },
];

export default function BottomNavbar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try { supabase = createClient(); } catch { return; }
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let activeUserId: string | undefined;
    let mounted = true;
    // Refresh the count on events; only create a Realtime channel when the signed-in user changes.
    async function refreshCount(subscribe = true) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) {
        setUnreadCount(0);
        activeUserId = undefined;
        if (channel) void supabase.removeChannel(channel);
        channel = undefined;
        return;
      }
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
      if (!mounted) return;
      setUnreadCount(count ?? 0);
      if (subscribe && activeUserId !== user.id) {
        if (channel) void supabase.removeChannel(channel);
        activeUserId = user.id;
        // React Strict Mode can remount this effect before removeChannel from
        // the previous mount has completed. A unique name prevents reusing
        // that already-subscribed channel instance.
        channel = supabase.channel(`nav-notifications-${user.id}-${crypto.randomUUID()}`)
          // Realtime callbacks pass false so they refresh the count without registering another listener.
          .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => void refreshCount(false))
          .subscribe();
      }
    }
    // Auth callbacks run while Supabase is dispatching an auth event. Defer the
    // async refresh so it can safely create/remove Realtime channels afterward.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refreshCount(), 0);
    });
    void refreshCount();
    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-4 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-20 flex-col items-center gap-1 py-3 text-xs font-medium transition ${
                isActive ? "text-rose-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="relative text-2xl" aria-hidden="true">
                {item.icon}
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -right-3 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
