"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { profiles } from "@/src/lib/profiles";

type Message = {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
};

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ChatRoom() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();

  const personId = Number(params.conversationId);
  const person = profiles.find((profile) => profile.id === personId);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    // the conversation
    {
      id: 1,
      text: "Hey! 😊 It's nice to finally chat with you!",
      sender: "them",
      time: "9:32 AM",
    },
    {
      id: 2,
      text: "Hi! 👋 Thanks for messaging me!",
      sender: "me",
      time: "9:34 AM",
    },
    {
      id: 3,
      text: "How's your day going so far?",
      sender: "them",
      time: "9:35 AM",
    },
    {
      id: 4,
      text: "Pretty good! Just relaxing. How about you?",
      sender: "me",
      time: "9:37 AM",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // React track the bottomRef.current
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
    console.log(messages);
  }, [messages]);

  if (!person) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Person not found.</p>
      </main>
    );
  }

  function handleSendMessage(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();

    if (!text) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      sender: "me",
      time: getCurrentTime(),
    };

    setMessages((previousMessages) => [...previousMessages, newMessage]);

    setInput("");
  }

  return (
    <main className="flex h-dvh flex-col bg-white">
      {/* Chat header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="rounded-full px-2 py-1 text-2xl text-rose-500 hover:bg-rose-50"
        >
          ←
        </button>

        <img
          src={person.image}
          alt={person.name}
          className="h-12 w-12 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-bold text-gray-900">{person.name}</h1>
          <p className="text-sm text-green-500">Online</p>
        </div>

        <button
          type="button"
          aria-label="More options"
          className="rounded-full px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
        >
          ⋮
        </button>
      </header>

      {/* Message list */}
      <section
        aria-label="Conversation messages"
        className="flex-1 space-y-5 overflow-y-auto bg-gray-50 px-4 py-6"
      >
        <p className="text-center text-xs text-gray-400">Today</p>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender === "me" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "them" && (
              <img
                src={person.image}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            )}

            <div
              className={`max-w-[80%] sm:max-w-[70%] ${
                message.sender === "me" ? "items-end" : "items-start"
              } flex flex-col`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-6 sm:text-base ${
                  message.sender === "me"
                    ? "rounded-br-sm bg-rose-500 text-white"
                    : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
                }`}
              >
                {message.text}
              </div>

              <span className="mt-1 px-1 text-xs text-gray-400">
                {message.time}
              </span>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
        {/* attach bottomRed to a div*/}
      </section>

      {/* Message composer */}
      <form
        onSubmit={handleSendMessage}
        className="flex shrink-0 items-center gap-3 border-t border-gray-100 bg-white px-3 py-3 sm:px-4"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message..."
          aria-label="Type a message"
          className="min-w-0 flex-1 rounded-full bg-gray-100 px-5 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose-200 sm:text-base"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xl text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↑
        </button>
      </form>
    </main>
  );
}

export default function IndividualChatPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading chat...</p>}>
      <ChatRoom />
    </Suspense>
  );
}
