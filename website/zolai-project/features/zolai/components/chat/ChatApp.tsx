"use client";

import * as React from "react";
import Link from "next/link";
import { PanelLeft, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

type HistoryItem = {
  id: string;
  title?: string;
  updated_at?: string;
  model?: string;
};

function parseSseLines(buffer: string): { events: string[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  return { events: parts, rest };
}

function extractDataLine(evt: string): string | null {
  const line = evt
    .split("\n")
    .map((l) => l.trimEnd())
    .find((l) => l.startsWith("data:"));
  if (!line) return null;
  return line.replace(/^data:\s?/, "");
}

function useAutoScroll(dep: unknown) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [dep]);
  return ref;
}

export function ChatApp() {
  const [models, setModels] = React.useState<string[]>([]);
  const [model, setModel] = React.useState<string>("gemini-3-flash");
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [providerChatId, setProviderChatId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", content: "Kum. What do you want to practice (Tedim)?" },
  ]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [statusText, setStatusText] = React.useState<string | null>(null);
  const [statusOk, setStatusOk] = React.useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState<boolean>(false);

  const messageListRef = useAutoScroll(messages);

  const refreshModels = React.useCallback(async () => {
    const resp = await fetch("/api/zolai/ai/models");
    if (!resp.ok) throw new Error("Failed to load models");
    const payload = await resp.json() as { success?: boolean; data?: unknown };
    const arr = Array.isArray(payload?.data) ? payload.data : [];
    const names = arr
      .map((x: any) => x?.name)
      .filter((n: any): n is string => typeof n === "string" && n.length > 0);
    setModels(names);
    if (names.length > 0 && !names.includes(model)) setModel(names[0]);
  }, [model]);

  const refreshHistory = React.useCallback(async () => {
    const resp = await fetch("/api/zolai/ai/chats");
    if (!resp.ok) throw new Error("Failed to load history");
    const payload = await resp.json() as { success?: boolean; data?: unknown };
    const items = Array.isArray(payload?.data) ? payload.data : [];
    setHistory(
      items
        .map((x: any) => ({
          id: String(x?.id ?? ""),
          title: typeof x?.title === "string" ? x.title : undefined,
          updated_at: typeof x?.updatedAt === "string" ? x.updatedAt : (typeof x?.updated_at === "string" ? x.updated_at : undefined),
          model: typeof x?.model === "string" ? x.model : undefined,
        }))
        .filter((x: HistoryItem) => x.id.length > 0),
    );
  }, []);

  const refreshStatus = React.useCallback(async () => {
    try {
      const resp = await fetch("/api/zolai/ai/status");
      if (!resp.ok) {
        setStatusOk(false);
        setStatusText(`Status check failed (HTTP ${resp.status}).`);
        return;
      }
      const payload = await resp.json() as any;
      if (payload?.success && payload?.data?.ok === true) {
        setStatusOk(true);
        setStatusText(null);
        return;
      }
      setStatusOk(false);
      const err = payload?.data?.error || payload?.error?.message || "Gemini server not ready (check cookies/credentials).";
      setStatusText(String(err));
    } catch (e) {
      setStatusOk(false);
      setStatusText(e instanceof Error ? e.message : "Status check failed.");
    }
  }, []);

  React.useEffect(() => {
    void Promise.allSettled([refreshModels(), refreshHistory(), refreshStatus()]);
  }, [refreshModels, refreshHistory, refreshStatus]);

  const openChat = React.useCallback(async (id: string) => {
    setThreadId(id);
    setStatusText(null);
    try {
      const resp = await fetch(`/api/zolai/ai/chats/${encodeURIComponent(id)}`);
      if (!resp.ok) throw new Error("Failed to load chat");
      const payload = await resp.json() as { success?: boolean; data?: any };
      const thread = payload?.data;
      setProviderChatId(typeof thread?.providerChatId === "string" ? thread.providerChatId : null);
      const msgs: Msg[] = (thread?.messages ?? [])
        .map((t: any) => ({ role: t?.role === "user" ? "user" : "assistant", content: String(t?.content ?? "") }))
        .filter((m: Msg) => m.content.trim().length > 0);
      setMessages(msgs.length ? msgs : [{ role: "assistant", content: "Chat is empty." }]);
      setMobileSidebarOpen(false);
    } catch (e) {
      setMessages([{ role: "assistant", content: `Error loading chat: ${e instanceof Error ? e.message : "Unknown error"}` }]);
    }
  }, []);

  const newChat = React.useCallback(() => {
    setThreadId(null);
    setProviderChatId(null);
    setMessages([{ role: "assistant", content: "Kum. What do you want to practice (Tedim)?" }]);
    setStatusText(null);
    setMobileSidebarOpen(false);
  }, []);

  const ensureThread = React.useCallback(async (firstUserMessage: string): Promise<string> => {
    if (threadId) return threadId;
    const title = firstUserMessage.trim().slice(0, 60) || "New chat";
    const resp = await fetch("/api/zolai/ai/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, model, provider: "gemini-server" }),
    });
    if (!resp.ok) throw new Error("Failed to create chat");
    const payload = await resp.json() as any;
    const id = String(payload?.data?.id ?? "");
    if (!id) throw new Error("Failed to create chat");
    setThreadId(id);
    void refreshHistory();
    return id;
  }, [model, refreshHistory, threadId]);

  const saveMessage = React.useCallback(async (id: string, role: Role, content: string) => {
    if (!content.trim()) return;
    await fetch(`/api/zolai/ai/chats/${encodeURIComponent(id)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content }),
    });
  }, []);

  const send = React.useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setIsStreaming(true);
    setStatusText(null);

    const id = await ensureThread(text);
    await saveMessage(id, "user", text);
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);

    const streamOnce = async (): Promise<void> => {
      const resp = await fetch("/api/zolai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }],
          model,
          chat_id: providerChatId ?? undefined,
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
          let payload: any;
          try {
            payload = JSON.parse(dataStr);
          } catch {
            continue;
          }
          if (payload?.error) throw new Error(String(payload.error));

          if (payload?.chat_id && !providerChatId) {
            const pcid = String(payload.chat_id);
            setProviderChatId(pcid);
            void fetch(`/api/zolai/ai/chats/${encodeURIComponent(id)}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ providerChatId: pcid, model }),
            });
          }
          if (payload?.delta) {
            setMessages((prev) => {
              const next = [...prev];
              const lastIdx = next.length - 1;
              if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
                next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + String(payload.delta) };
              }
              return next;
            });
          }
        }
      }
    };

    try {
      await streamOnce();
      // Persist assistant message after stream finishes
      const assistant = (() => {
        const last = messages[messages.length - 1];
        return last?.role === "assistant" ? last.content : "";
      })();
      // We can't reliably read state synchronously; take it from rendered state after a tick
      setTimeout(() => {
        const latest = (document.querySelector("[data-chat-last-assistant]") as HTMLElement | null)?.innerText ?? "";
        void saveMessage(id, "assistant", latest);
        void refreshHistory();
      }, 0);
    } catch (e) {
      // Fallback: try non-streaming once, then surface error.
      try {
        const resp2 = await fetch("/api/zolai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: text }],
            model,
            chat_id: chatId ?? undefined,
          }),
        });
        if (!resp2.ok) throw e;
        const payload = await resp2.json() as any;
        const content = String(payload?.data?.text ?? payload?.text ?? payload?.data?.message?.content ?? "");
        const nextChatId = payload?.data?.chat_id ?? payload?.chat_id;
        if (nextChatId && !chatId) setChatId(String(nextChatId));
        setMessages((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
            next[lastIdx] = { ...next[lastIdx], content: content || next[lastIdx].content };
          } else {
            next.push({ role: "assistant", content: content || "(no response)" });
          }
          return next;
        });
        void refreshHistory();
        setStatusText("Streaming failed; used fallback response.");
      } catch {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setStatusText(msg);
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
      }
    } finally {
      setIsStreaming(false);
    }
  }, [ensureThread, input, isStreaming, messages, model, providerChatId, refreshHistory, saveMessage]);

  return (
    <div className="h-[calc(100vh-180px)] min-h-[650px] rounded-xl border bg-background overflow-hidden">
      <div className={cn("grid h-full grid-cols-1", sidebarOpen ? "md:grid-cols-[320px_1fr]" : "md:grid-cols-[1fr]")}>
        {/* Sidebar */}
        {sidebarOpen && (
        <aside className="hidden md:flex flex-col border-r bg-muted/20">
          <div className="p-3 flex items-center gap-2 border-b bg-background/60">
            <Button size="sm" onClick={newChat}>New chat</Button>
            <div className="ml-auto text-xs text-muted-foreground">
              <Link href="http://localhost:8000" className="underline underline-offset-2">gemini-server</Link>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 flex flex-col gap-1">
              {history.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No chats yet.</div>
              ) : history.map((h) => (
                <button
                  key={h.id}
                  className={cn(
                    "text-left rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                    threadId === h.id ? "bg-muted/60" : "",
                  )}
                  onClick={() => void openChat(h.id)}
                >
                  <div className="truncate font-medium">{h.title || h.id}</div>
                  {h.updated_at && <div className="truncate text-xs text-muted-foreground">{h.updated_at}</div>}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>
        )}

        {/* Mobile sidebar drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileSidebarOpen(false)}>
            <div className="absolute inset-y-0 left-0 w-[85vw] max-w-[360px] bg-background border-r shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-3 flex items-center gap-2 border-b">
                <Button size="sm" onClick={newChat}>New</Button>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setMobileSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-64px)]">
                <div className="p-2 flex flex-col gap-1">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      className={cn(
                        "text-left rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                        threadId === h.id ? "bg-muted/60" : "",
                      )}
                      onClick={() => void openChat(h.id)}
                    >
                      <div className="truncate font-medium">{h.title || h.id}</div>
                      {h.updated_at && <div className="truncate text-xs text-muted-foreground">{h.updated_at}</div>}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Main */}
        <section className="flex flex-col min-w-0">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur p-3">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="hidden md:inline-flex" onClick={() => setSidebarOpen((v) => !v)}>
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold">Chat</div>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border",
                    statusOk === true && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    statusOk === false && "border-destructive/30 bg-destructive/10 text-destructive",
                    statusOk === null && "border-muted-foreground/20 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      statusOk === true && "bg-emerald-500",
                      statusOk === false && "bg-destructive",
                      statusOk === null && "bg-muted-foreground/40",
                    )}
                  />
                  {statusOk === true ? "Ready" : statusOk === false ? "Not ready" : "Unknown"}
                </span>

                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">Model</div>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isStreaming}
                  >
                    {(models.length ? models : [model]).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <Button size="sm" variant="outline" onClick={() => void refreshStatus()} disabled={isStreaming}>
                  Status
                </Button>
              </div>
            </div>

            {statusText && (
              <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
                <div className="font-medium mb-1">Gemini server issue</div>
                <div className="text-muted-foreground break-words">{statusText}</div>
                <div className="mt-2 text-xs">
                  Fix: open <a className="underline underline-offset-2" href="http://localhost:8000">`gemini-server`</a> → Settings → Credentials → reconnect cookies.
                </div>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-hidden bg-muted/10">
            <ScrollArea className="h-full">
              <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-4" ref={messageListRef}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      data-chat-last-assistant={m.role === "assistant" && idx === messages.length - 1 ? "1" : undefined}
                      className={cn(
                        "max-w-[90%] sm:max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border",
                      )}
                    >
                      {m.content || (m.role === "assistant" && isStreaming ? "…" : "")}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <footer className="border-t bg-background p-3">
            <div className="mx-auto w-full max-w-3xl flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message… (Ctrl+Enter to send)"
                className="min-h-12 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    void send();
                  }
                }}
                disabled={isStreaming}
              />
              <Button onClick={() => void send()} disabled={isStreaming || input.trim().length === 0}>
                {isStreaming ? "Streaming…" : "Send"}
              </Button>
            </div>
            <div className="mx-auto w-full max-w-3xl mt-2 text-xs text-muted-foreground">
              Tip: use the sidebar to resume chats. If Gemini aborts, hit Status and reconnect cookies.
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}

