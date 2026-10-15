"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { profiles } from "@/src/lib/profiles";
import { incomingInterests } from "@/src/types/interests";

export default function InterestsPage() {
  const router = useRouter();

  const [acceptedIds, setAcceptedIds] = useState<number[]>([]);
  const [declinedIds, setDeclinedIds] = useState<number[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const visibleInterests = incomingInterests.filter(
    (interest) =>
      !acceptedIds.includes(interest.id) && !declinedIds.includes(interest.id),
  );

  const selectedInterest = incomingInterests.find(
    (interest) => interest.id === selectedPersonId,
  );

  const selectedPerson = profiles.find(
    (person) => person.id === selectedPersonId,
  );

  function acceptInterest(id: number) {
    setAcceptedIds((previous) => [...previous, id]);
    setSelectedPersonId(id);
  }

  function declineInterest(id: number) {
    setDeclinedIds((previous) => [...previous, id]);
  }

  function startChat() {
    if (!selectedPerson || !selectedInterest) return;

    const personId = selectedPerson.id;

    // Match the localStorage key used by your chat page.
    const storageKey = `chat-${personId}`;

    // Add the message this person sent you.
    const incomingMessage = {
      id: Date.now(),
      text: selectedInterest.message,
      sender: "them" as const,
      time: selectedInterest.time,
    };

    try {
      const savedMessages = localStorage.getItem(storageKey);
      const messages = savedMessages ? JSON.parse(savedMessages) : [];

      if (Array.isArray(messages)) {
        // Don't add the same initial message twice.
        const alreadyExists = messages.some(
          (message) => message.text === incomingMessage.text,
        );

        if (!alreadyExists) {
          localStorage.setItem(
            storageKey,
            JSON.stringify([...messages, incomingMessage]),
          );
        }
      } else {
        localStorage.setItem(storageKey, JSON.stringify([incomingMessage]));
      }
    } catch {
      localStorage.setItem(storageKey, JSON.stringify([incomingMessage]));
    }

    setSelectedPersonId(null);
    router.push(`/chat/${personId}`);
  }

  return (
    <main className="min-h-screen bg-[#fff8fa] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-wide text-pink-500">
            SOMEONE LIKES YOU ♡
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Interested in you
          </h1>

          <p className="mt-3 text-gray-500">
            These people would love to get to know you.
          </p>

          <div className="mt-5 inline-flex rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
            {visibleInterests.length} incoming{" "}
            {visibleInterests.length === 1 ? "interest" : "interests"}
          </div>
        </header>

        {visibleInterests.length === 0 ? (
          <div className="rounded-3xl border border-pink-100 bg-white px-6 py-16 text-center">
            <div className="mb-4 text-5xl">💌</div>
            <h2 className="text-xl font-bold text-gray-900">
              {"You're all caught up!"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              New interests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleInterests.map((interest) => {
              const person = profiles.find(
                (profile) => profile.id === interest.id,
              );

              if (!person) return null;

              return (
                <article
                  key={interest.id}
                  className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100"
                >
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-pink-200 via-rose-100 to-purple-100">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white text-3xl shadow-sm">
                      💗
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900">
                      {person.name}
                    </h2>

                    <p className="mt-3 text-xs text-gray-400">
                      {interest.time}
                    </p>

                    <div className="mt-2 rounded-2xl bg-pink-50 p-3">
                      <p className="text-sm leading-6 text-gray-600">
                        {interest.message}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => declineInterest(interest.id)}
                        className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => acceptInterest(interest.id)}
                        className="rounded-xl bg-pink-500 px-3 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
                      >
                        Accept ♡
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Match confirmation modal */}
      {selectedPerson && selectedInterest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedPersonId(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-title"
            className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 text-5xl">💞</div>

            <p className="mb-2 text-sm font-semibold text-pink-500">
              {"IT'S A CONNECTION!"}
            </p>

            <h2 id="match-title" className="text-2xl font-bold text-gray-900">
              You accepted {selectedPerson.name}!
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {selectedPerson.name} sent you a message. Want to start chatting?
            </p>

            <button
              onClick={startChat}
              className="mt-7 w-full rounded-xl bg-pink-500 py-3.5 font-semibold text-white transition hover:bg-pink-600"
            >
              {" Let's chat 💌"}
            </button>

            <button
              onClick={() => setSelectedPersonId(null)}
              className="mt-3 w-full rounded-xl py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Maybe later
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
