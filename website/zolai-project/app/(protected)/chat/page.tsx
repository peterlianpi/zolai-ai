import type { Metadata } from "next";
import { ChatApp } from "@/features/zolai/components/chat/ChatApp";

export const metadata: Metadata = {
  title: "Chat - Zolai AI",
  description: "Local-first chat routed through Zolai Toolkit to gemini-server",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">Streaming responses from your local Gemini server</p>
      </div>
      <div className="flex-1 min-h-[600px]">
        <ChatApp />
      </div>
    </div>
  );
}

