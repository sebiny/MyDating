"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { profiles } from "@/src/lib/profiles";

export default function IndividualChatPage() {
  return (
    //Suspense is a React Component that handles certain kinds of waiting, it provides a fallback UI while Next.js waits for the components to resolve the URL data.
    <Suspense fallback={<p>Loading chat...</p>}>
      <ChatRoom />
      {/*ChatRoom contains useParams, so th e hook is now inside the Suspense boundary */}
    </Suspense>
  );
}

function ChatRoom() {
  const params = useParams<{ conversationId: string }>();
  //telling TS that the URL is a string

  const personId = Number(params.conversationId);

  const person = profiles.find((profile) => profile.id === personId);

  if (!person) {
    return <p>Person not found.</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white p-4">
        <h1 className="text-lg font-bold">{person.name}</h1>
      </header>

      <section className="p-4">
        <p>You are chatting with {person.name}.</p>
      </section>
    </main>
  );
}
