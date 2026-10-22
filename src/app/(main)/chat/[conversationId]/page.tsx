import { Suspense } from "react";
import ChatClient from "./chat-client";

export default function ChatRoute() {
  // useParams() inside the client chat needs runtime route data, so keep it under Suspense.
  return <Suspense fallback={<main className="p-8 text-center text-gray-500">Loading chat…</main>}>
    <ChatClient />
  </Suspense>;
}
