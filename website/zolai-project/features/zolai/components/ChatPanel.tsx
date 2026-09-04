"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ChatMsg = { role: "user" | "assistant"; content: string };

function parseSseLines(buffer: string): { events: string[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  return { events: parts, rest };
}

function extractDataLine(evt: string): string | null {
  // Minimal SSE parsing: find first `data:` line and strip prefix.
  const line = evt
    .split("\n")
    .map((l) => l.trimEnd())
    .find((l) => l.startsWith("data:"));
  if (!line) return null;
  return line.replace(/^data:\s?/, "");
}

export function ChatPanel() {
  const [messages, setMessages] = React.useState<ChatMsg[]>([
    { role: "assistant", content: "Kum. What do you want to practice (Tedim)?" },
  ]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [models, setModels] = React.useState<string[]>([]);
  const [model, setModel] = React.useState<string>("gemini-3-flash");

  React.useEffect(() => {
    let ignore = false;
    void (async () => {
      try {
        const resp = await fetch("/api/zolai/ai/models");
        if (!resp.ok) return;
        const data = (await resp.json()) as { models?: Array<{ name?: string }>; detail?: unknown };
        const names = (data.models ?? []).map((m) => m.name).filter((n): n is string => !!n);
        if (!ignore && names.length > 0) {
          setModels(names);
          setModel((prev) => (names.includes(prev) ? prev : names[0]));
        }
      } catch {
        // ignore: models endpoint is optional in some deployments
      }
    })();
    return () => { ignore = true; };
  }, []);

  const send = React.useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const resp = await fetch("/api/zolai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Zolai Toolkit expects messages with role/content
          messages: [
            ...messages,
            { role: "user", content: text },
          ].map((m) => ({ role: m.role, content: m.content })),
          model,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const { events, rest } = parseSseLines(buf);
        buf = rest;

        for (const evt of events) {
          const dataStr = extractDataLine(evt);
          if (!dataStr) continue;

          let payload: unknown;
          try {
            payload = JSON.parse(dataStr);
          } catch {
            continue;
          }

          const p = payload as { delta?: string; done?: boolean; error?: string; thoughts?: string };
          if (p.error) throw new Error(p.error);
          if (p.delta) {
            setMessages((prev) => {
              const next = [...prev];
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
                next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + p.delta };
              }
              return next;
            });
          }
          if (p.done) break;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) => {
        const next = [...prev];
        const lastIdx = next.length - 1;
        if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
          next[lastIdx] = { ...next[lastIdx], content: `Error: ${msg}` };
        } else {
          next.push({ role: "assistant", content: `Error: ${msg}` });
        }
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>AI Chat (local gemini-server)</CardTitle>
          <CardDescription>
            Website → `/api/zolai/chat/stream` → `gemini-server`
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 overflow-auto py-4">
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">Model</div>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isStreaming}
            >
              {(models.length > 0 ? models : [model]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground">Send: Ctrl+Enter</div>
          </div>
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[80%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm whitespace-pre-wrap"
                  : "mr-auto max-w-[80%] rounded-lg border bg-card px-3 py-2 text-sm whitespace-pre-wrap"
              }
            >
              {m.content || (m.role === "assistant" && isStreaming ? "…" : "")}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 flex gap-3 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in Zolai/Tedim…"
            className="min-h-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button onClick={() => void send()} disabled={isStreaming || input.trim().length === 0}>
            {isStreaming ? "Streaming…" : "Send"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

