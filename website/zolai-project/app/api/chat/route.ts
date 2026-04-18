import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getTutorSystemPrompt, getChatSystemPrompt } from "@/lib/zolai/curriculum";
import { generateChatCompletion, type Provider } from "@/lib/ai/providers";

const VALID_PROVIDERS: Provider[] = ["groq", "gemini", "openrouter", "pollinations"];

function defaultModel(provider: Provider): string {
  const map: Record<Provider, string> = {
    groq:        "llama-3.3-70b-versatile",
    gemini:      "gemini-2.0-flash", // Updated to Flash 2.0 for better ZVS reasoning
    openrouter:  "deepseek/deepseek-r1:free", // Added DeepSeek for better reasoning
    pollinations:"openai",
  };
  return map[provider];
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    sessionId?: string;
    message?: string;
    messages?: Array<{ role: string; content: string }>;
    provider?: string;
    model?: string;
    tutor?: boolean;
    level?: string;
    mode?: string;
  };
  const { message, messages: incomingMessages, tutor, level, mode } = body;
  
  // Greeting handling: If the user message is a simple greeting, force a conversational tone
  const lastMessage = message ?? incomingMessages?.findLast(m => m.role === "user")?.content ?? "";
  const isGreeting = /^(hi|hello|zingsang|nitak|dam in)/i.test(lastMessage);

  const reqProvider = body.provider;
  const reqModel = body.model;
  const userPrefs = await prisma.userPreferences.findUnique({ where: { userId: session.user.id } });

  const provider: Provider = (VALID_PROVIDERS.includes(reqProvider as Provider) ? reqProvider as Provider : null)
    ?? (VALID_PROVIDERS.includes(userPrefs?.aiProvider as Provider) ? userPrefs!.aiProvider as Provider : null)
    ?? "gemini";

  const model = reqModel ?? userPrefs?.aiModel ?? defaultModel(provider);

  const msgs: Array<{ role: "user" | "assistant" | "system"; content: string }> = (incomingMessages ?? [])
    .filter((m): m is { role: "user" | "assistant" | "system"; content: string } => 
      ["user", "assistant", "system"].includes(m.role)
    );
  if (msgs.length === 0) msgs.push({ role: "user", content: lastMessage });

  // System Prompt Logic: Tutor vs Normal AI
  const sysContent = (tutor && !isGreeting) 
    ? getTutorSystemPrompt(level ?? "A1", mode ?? "conversation")
    : getChatSystemPrompt();

  if (msgs[0]?.role === "system") {
    msgs[0].content = sysContent;
  } else {
    msgs.unshift({ role: "system", content: sysContent });
  }

  try {
    const reply = await generateChatCompletion({
      provider,
      model,
      messages: msgs,
      temperature: tutor ? 0.6 : 0.7,
      maxTokens: 1000,
    }) as string;

    // ... (keep existing Prisma session/message saving logic)
    return NextResponse.json({ reply });
  } catch (err) {
    console.error(`Chat error:`, err);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
