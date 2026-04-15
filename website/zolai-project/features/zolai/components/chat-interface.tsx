"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAvailableModels } from "@/lib/api/hooks";
import { client } from "@/lib/api/client";
import { History, Send, User, Bot, Plus, Trash2, Menu } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type Session = { id: string; title: string; provider: string; model: string; updatedAt: string };

const PROVIDERS = [
  { id: "openrouter", name: "OpenRouter" },
  { id: "groq", name: "Groq" },
  { id: "gemini", name: "Gemini" },
  { id: "nvidia", name: "NVIDIA" },
] as const;

export function ChatInterface() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [level] = useState("A1");
  const [mode] = useState("conversation");
  const [provider, setProvider] = useState("openrouter");
  const [model, setModel] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: modelsData, isLoading: modelsLoading } = useAvailableModels(provider);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, loading]);

  useEffect(() => {
    setModel("");
    if (modelsData?.models?.length > 0) {
      const t = setTimeout(() => setModel(modelsData.models[0].id), 100);
      return () => clearTimeout(t);
    }
  }, [provider, modelsData?.models]);

  const loadSessions = useCallback(async () => {
    const res = await client.api.chat.sessions.$get();
    if (res.ok) setSessions(await res.json());
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setStreamingText("");
    try {
      const res = await client.api.chat.$post({ json: { messages: next, level, mode, tutor: false } });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
      // Simulate streaming
      const words = (data as { reply: string; sessionId?: string }).reply.split(" ");
      setLoading(false);
      let current = "";
      for (let i = 0; i < words.length; i++) {
        current += (i > 0 ? " " : "") + words[i];
        setStreamingText(current);
        await new Promise(r => setTimeout(r, 40 + Math.random() * 60));
      }
      setMessages([...next, { role: "assistant", content: (data as { reply: string }).reply }]);
      setStreamingText("");
      const sid = (data as { sessionId?: string }).sessionId;
      if (sid && !sessionId) { setSessionId(sid); loadSessions(); }
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `Error: ${e instanceof Error ? e.message : "Chat failed"}` }]);
      setLoading(false);
      setStreamingText("");
    }
  }

  async function loadSession(s: Session) {
    setSessionId(s.id);
    setProvider(s.provider);
    setModel(s.model);
    const res = await client.api.chat.sessions[":id"].$get({ param: { id: s.id } });
    const data = await res.json();
    setMessages((data as { messages?: Message[] }).messages ?? []);
    setSidebarOpen(false);
  }

  async function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await client.api.chat.sessions[":id"].$delete({ param: { id } });
    setSessions(prev => prev.filter(s => s.id !== id));
    if (sessionId === id) { setSessionId(null); setMessages([]); }
  }

  function newChat() { setSessionId(null); setMessages([]); setSidebarOpen(false); }

  return (
    <div className="fixed inset-0 flex bg-background">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2"><History className="h-5 w-5" />Chat History</SheetTitle>
            </SheetHeader>
            <div className="p-4"><Button onClick={newChat} className="w-full justify-start mb-2"><Plus className="h-4 w-4 mr-2" />New Chat</Button></div>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-1 pb-4">
                {sessions.map(s => (
                  <div key={s.id} className="group relative">
                    <Button variant="ghost" className="w-full justify-start text-left h-auto p-3 pr-10" onClick={() => loadSession(s)}>
                      <div className="truncate">
                        <div className="font-medium truncate">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{s.provider} · {new Date(s.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </Button>
                    <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      onClick={e => deleteSession(s.id, e)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}><Menu className="h-4 w-4" /></Button>
            <h1 className="font-semibold">Zolai AI Chat</h1>
            {model && <Badge variant="outline" className="text-xs hidden sm:inline-flex">{model.split("/").pop()}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1">
              {PROVIDERS.slice(0, 3).map(p => (
                <Button key={p.id} size="sm" variant={provider === p.id ? "default" : "ghost"} onClick={() => setProvider(p.id)} className="h-8 px-3 text-xs">{p.name}</Button>
              ))}
            </div>
            <Select value={model} onValueChange={setModel} disabled={modelsLoading}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder={modelsLoading ? "Loading…" : "Model"} /></SelectTrigger>
              <SelectContent>
                {modelsData?.models?.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !loading && !streamingText ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">How can I help you today?</h3>
                <p className="text-muted-foreground text-sm">Start a conversation with Zolai AI</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((m, i) => (
                <div key={i} className={`px-4 py-6 ${m.role === "assistant" ? "bg-muted/50" : ""}`}>
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                      {m.role === "user" ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-secondary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0 prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                </div>
              ))}
              {streamingText && (
                <div className="px-4 py-6 bg-muted/50">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-secondary-foreground" /></div>
                    <div className="flex-1 whitespace-pre-wrap text-sm">{streamingText}<span className="animate-pulse">|</span></div>
                  </div>
                </div>
              )}
              {loading && !streamingText && (
                <div className="px-4 py-6 bg-muted/50">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Bot className="h-4 w-4 text-secondary-foreground" /></div>
                    <div className="flex gap-1 items-center">
                      {[0, 0.1, 0.2].map(d => <div key={d} className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t bg-card p-4 shrink-0">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Message Zolai AI…"
              disabled={loading || !model}
              className="flex-1"
            />
            <Button onClick={send} disabled={loading || !input.trim() || !model} size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
