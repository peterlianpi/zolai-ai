"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAvailableModels, useChat } from "@/lib/api/hooks";
import { History, Send, User, Bot, Settings, Menu } from "lucide-react";

type Message = { role: "user" | "assistant" | "system"; content: string; feedback?: "helpful" | "incorrect" };
type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type Mode = "translation" | "grammar" | "reading" | "conversation";

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const MODES: Mode[] = ["translation", "grammar", "reading", "conversation"];
const PROVIDERS = [
  { id: "openrouter", name: "OpenRouter" },
  { id: "groq", name: "Groq" },
  { id: "gemini", name: "Gemini" },
] as const;

type HistoryEntry = { id: string; title: string; messages: Message[]; level: Level; mode: Mode; provider: string; model: string };

export function TutorInterface() {
  const [level, setLevel] = useState<Level>("A1");
  const [mode, setMode] = useState<Mode>("conversation");
  const [provider, setProvider] = useState("openrouter");
  const [model, setModel] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: modelsData, isLoading: modelsLoading } = useAvailableModels(provider);
  const chatMutation = useChat();

  // Use selected model or fall back to first available model
  const currentModel = model || modelsData?.models?.[0]?.id || "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    try {
      const result = await chatMutation.mutateAsync({ messages: next, level, mode, tutor: true, provider, model: currentModel });
      const reply = (result as unknown as { reply: string }).reply;
      const final: Message[] = [...next, { role: "assistant", content: reply }];
      setMessages(final);
      if (messages.length === 0) {
        setHistory(prev => [{ id: Date.now().toString(), title: text.slice(0, 40), messages: final, level, mode, provider, model }, ...prev.slice(0, 9)]);
      }
    } catch (e) {
      setMessages([...next, { role: "assistant", content: `Error: ${e instanceof Error ? e.message : "Chat failed"}` }]);
    }
  }

  function feedback(i: number, fb: "helpful" | "incorrect") {
    setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, feedback: fb } : m));
  }

  function loadHistory(entry: HistoryEntry) {
    setMessages(entry.messages);
    setLevel(entry.level);
    setMode(entry.mode);
    setProvider(entry.provider);
    setModel(entry.model);
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen bg-background">
      {/* History Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 sm:w-96">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><History className="h-5 w-5" />History</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-2">
            <Button onClick={() => { setMessages([]); setSidebarOpen(false); }} variant="outline" className="w-full justify-start">+ New Chat</Button>
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="space-y-1">
                {history.map(h => (
                  <Button key={h.id} variant="ghost" className="w-full justify-start text-left h-auto p-3" onClick={() => loadHistory(h)}>
                    <div className="truncate">
                      <div className="font-medium truncate text-sm">{h.title}</div>
                      <div className="text-xs text-muted-foreground">{h.level} · {h.mode}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Sidebar */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-64 sm:w-80">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Settings</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-6 px-2">
            <div>
              <label className="text-sm font-medium mb-3 block">CEFR Level</label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map(l => (
                  <Button key={l} size="sm" variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)} className="h-9">
                    {l}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">Learning Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map(m => (
                  <Button key={m} size="sm" variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)} className="h-9 capitalize">
                    {m}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">AI Provider</label>
              <div className="grid grid-cols-1 gap-3">
                {PROVIDERS.map(p => (
                  <Button key={p.id} size="sm" variant={provider === p.id ? "default" : "outline"} onClick={() => setProvider(p.id)} className="h-10 px-2">
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">Model</label>
              <Select value={currentModel} onValueChange={setModel} disabled={modelsLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={modelsLoading ? "Loading…" : "Select model"} />
                </SelectTrigger>
                <SelectContent>
                  {modelsData?.models?.map((m: { id: string; name: string }) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="font-semibold text-sm sm:text-base truncate">Zolai AI Tutor</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">Tedim ZVS</Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{level} · {mode}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} className="shrink-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3 sm:p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-16">
                <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Welcome to Zolai AI Tutor</h3>
                <p className="text-muted-foreground text-sm">Practicing {mode} at {level} level</p>
                <p className="text-muted-foreground text-xs mt-1">Tedim ZVS dialect</p>
              </div>
            )}
            {messages.filter(m => m.role !== "system").map((m, i) => (
              <div key={i} className={`flex gap-2 sm:gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  {m.role === "assistant" && (
                    <div className="flex gap-1 mt-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className={`h-6 px-2 text-xs ${m.feedback === "helpful" ? "bg-green-100 dark:bg-green-900" : ""}`} 
                        onClick={() => feedback(i, "helpful")}
                      >
                        👍
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className={`h-6 px-2 text-xs ${m.feedback === "incorrect" ? "bg-red-100 dark:bg-red-900" : ""}`} 
                        onClick={() => feedback(i, "incorrect")}
                      >
                        👎
                      </Button>
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3 flex gap-1 items-center">
                  {[0, 0.1, 0.2].map(d => (
                    <div 
                      key={d} 
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" 
                      style={{ animationDelay: `${d}s` }} 
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t bg-card p-3 sm:p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={`Ask about ${mode} at ${level} level…`}
              disabled={chatMutation.isPending || !currentModel}
              className="flex-1 text-sm"
            />
            <Button 
              onClick={send} 
              disabled={chatMutation.isPending || !input.trim() || !currentModel} 
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
