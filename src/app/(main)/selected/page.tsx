"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNavbar from "@/src/components/layout/BottomNavbar";
import { Profile, profiles } from "@/src/lib/profiles";
import { useSelection } from "@/src/context/SelectionContext";

export default function SelectedPage() {
  const router = useRouter();

  const { selectedIds, removeSelection, clearSelection } = useSelection();

  const [showModal, setShowModal] = useState(false);
  const [chattingModal, setChattingModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Profile | null>(null);
  const selectedPeople = profiles.filter((profile) =>
    selectedIds.includes(profile.id),
  );

  function handleConfirm() {
    router.push("/chat");
  }

  function handleChattingModal(person: Profile) {
    setSelectedPerson(person);
    setChattingModal(true);
  }

  function handleStartChat(person: Profile | null) {
    if (!person) return;

    setChattingModal(false);
    router.push(`/chat/${person.id}`);
  }
  return (
    <main className="min-h-screen bg-[#faf8f6] pb-36 text-gray-900">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/home"
            className="text-sm text-gray-500 hover:text-rose-500"
          >
            ← Back to Discover
          </Link>

          <p className="mt-6 text-sm font-medium text-rose-500">
            YOUR COLLECTION
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your selected people.
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Take another look before making your next connection.
          </p>
        </header>

        {/* Selection count */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Selected people</h2>

          <span className="rounded-full bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
            {selectedPeople.length} selected
          </span>
        </div>

        {/* Empty state */}
        {selectedPeople.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <div className="mb-4 text-4xl">♡</div>

            <h2 className="text-lg font-semibold">No one selected yet</h2>

            <p className="mt-2 text-sm text-gray-500">
              Discover people and select the ones you like.
            </p>

            <Link
              href="/home"
              className="mt-6 inline-flex rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600"
            >
              Discover people
            </Link>
          </div>
        ) : (
          <>
            {/* Selected profile grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {selectedPeople.map((person) => (
                <article
                  key={person.id}
                  className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
                  onClick={() => handleChattingModal(person)}
                >
                  <div className="relative">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="aspect-[3/4] w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeSelection(person.id)}
                      aria-label={`Remove ${person.name}`}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg text-gray-700 shadow hover:bg-rose-50 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold">
                      {person.name}, {person.age}
                    </h3>

                    <p className="mt-1 text-xs font-medium text-rose-500">
                      {person.job}
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                      {person.introduction}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeSelection(person.id)}
                      className="mt-3 w-full rounded-xl bg-gray-100 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-600"
              >
                Confirm selection →
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5"
          onClick={() => setShowModal(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 text-center text-4xl text-rose-500">♡</div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleStartChat(selectedPerson)}
                className="w-full rounded-xl bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600"
              >
                Yes, go to chat
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Not now
              </button>
            </div>
          </section>
        </div>
      )}
      {chattingModal && selectedPerson && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5"
          onClick={() => setChattingModal(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-modal-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedPerson.image}
              alt={selectedPerson.name}
              className="mx-auto h-24 w-24 rounded-full object-cover"
            />

            <h2
              id="chat-modal-title"
              className="mt-4 text-center text-xl font-bold"
            >
              You wanna chat with {selectedPerson.name}?
            </h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              Start a conversation and get to know each other!
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleStartChat(selectedPerson)}
                className="w-full rounded-xl bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600"
              >
                {"Yes, let's chat!"}
              </button>

              <button
                type="button"
                onClick={() => setChattingModal(false)}
                className="w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
      <BottomNavbar />
    </main>
  );
}
