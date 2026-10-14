"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/home", icon: "⌂" },
  { label: "Chat", href: "/chat", icon: "♡" },
  { label: "Profile", href: "/profile", icon: "○" },
];

export default function BottomNavbar() {
  const pathname = usePathname();

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
              <span className="text-2xl" aria-hidden="true">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
