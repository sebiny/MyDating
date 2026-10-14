"use client";

import { useRouter } from "next/navigation";

import { useSelection } from "@/src/context/SelectionContext";
import { profiles } from "@/src/lib/profiles";
import BottomNavbar from "@/src/components/layout/BottomNavbar";

export default function ChatPage() {
  const router = useRouter();
  const { selectedIds } = useSelection();

  const selectedPeople = profiles.filter((person) =>
    selectedIds.includes(person.id),
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <header className="border-b bg-white p-5">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose someone to start chatting.
        </p>
      </header>

      <section className="divide-y bg-white">
        {selectedPeople.map((person) => (
          <button
            key={person.id}
            type="button"
            onClick={() => router.push(`/chat/${person.id}`)}
            className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50"
          >
            <img
              src={person.image}
              alt={person.name}
              className="h-14 w-14 rounded-full object-cover"
            />

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{person.name}</h2>
              <p className="truncate text-sm text-gray-500">{person.intro}</p>
            </div>

            <span className="text-sm text-rose-500">Chat →</span>
          </button>
        ))}

        {selectedPeople.length === 0 && (
          <p className="p-6 text-center text-gray-500">
            No selected people yet.
          </p>
        )}
      </section>

      <BottomNavbar />
    </main>
  );
}
