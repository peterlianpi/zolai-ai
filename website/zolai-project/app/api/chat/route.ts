import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { getTutorSystemPrompt } from "@/lib/zolai/curriculum";
import { generateChatCompletion, getModelInfo } from "@/lib/ai/providers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sessionId, message, messages: incomingMessages, provider: reqProvider, model: reqModel, tutor, level, mode } = await req.json();

  // Get user preferences for defaults
  const userPrefs = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });

  // Smart provider/model selection for tutoring
  const provider = reqProvider || userPrefs?.aiProvider || 'openrouter';
  const model = reqModel || userPrefs?.aiModel || getOptimalTutoringModel(provider, tutor);

  function getOptimalTutoringModel(provider: string, isTutor: boolean): string {
    if (!isTutor) {
      // Regular chat - use defaults
      return provider === 'groq' ? 'llama-3.3-70b-versatile' : 
             provider === 'gemini' ? 'gemini-2.0-flash-exp' :
             provider === 'openai' ? 'gpt-4o-mini' :
             provider === 'anthropic' ? 'claude-3-5-haiku-20241022' :
             provider === 'openrouter' ? 'deepseek/deepseek-chat' :
             provider === 'nvidia' ? 'deepseek-ai/deepseek-r1' :
             'deepseek/deepseek-chat';
    }
    
    // Tutoring - prioritize best free models for language learning
    return provider === 'groq' ? 'llama-3.3-70b-versatile' : 
           provider === 'gemini' ? 'gemini-2.0-flash-exp' :
           provider === 'openai' ? 'gpt-4o' :
           provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' :
           provider === 'openrouter' ? 'deepseek/deepseek-chat' :
           provider === 'nvidia' ? 'deepseek-ai/deepseek-r1' :
           provider === 'huggingface' ? 'microsoft/Phi-3-mini-4k-instruct' :
           'llama-3.3-70b-versatile';
  }

  // Validate provider and model
  const validProviders = ['groq', 'gemini', 'openai', 'anthropic', 'openrouter', 'nvidia'];
  if (!validProviders.includes(provider)) {
    return NextResponse.json(
      { error: `Unsupported provider: ${provider}` },
      { status: 400 }
    );
  }

  // Enhanced message handling with context awareness
  const lastMessage: string = message ?? incomingMessages?.findLast((m: { role: string; content?: string }) => m.role === 'user' && m.content)?.content ?? '';
  
  // Ensure all messages have valid content - filter out malformed messages
  const validatedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = 
    (incomingMessages ?? [])
      .filter((m): m is { role: 'user' | 'assistant' | 'system'; content: string } => 
        m?.content !== undefined && 
        m?.content !== null && 
        typeof m.content === 'string' &&
        m.content.trim().length > 0 &&
        ['user', 'assistant', 'system'].includes(m.role)
      );
  
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> =
    validatedMessages.length > 0 ? validatedMessages : [{ role: 'user', content: lastMessage }];

  // Add enhanced tutor system prompt
  if (tutor) {
    const systemPrompt = getTutorSystemPrompt(
      typeof level === 'string' ? level : 'A1',
      typeof mode === 'string' ? mode : 'conversation'
    );
    if (messages[0]?.role !== 'system') {
      messages.unshift({ role: 'system', content: systemPrompt });
    } else {
      // Update existing system prompt for tutoring
      messages[0].content = systemPrompt;
    }
  }

  // Smart message trimming for tutoring context
  const systemMsg = messages[0]?.role === 'system' ? messages[0] : null;
  const history = systemMsg ? messages.slice(1) : messages;
  
  // For tutoring, keep more context (last 15 messages) for better continuity
  const contextWindow = tutor ? 15 : 10;
  const trimmedMessages = systemMsg
    ? [systemMsg, ...history.slice(-contextWindow)]
    : history.slice(-contextWindow);

  try {
    // Generate response with tutoring-optimized parameters
    const reply = await generateChatCompletion({
      provider,
      model,
      messages: trimmedMessages,
      temperature: tutor ? 0.6 : 0.7, // Slightly lower for more consistent tutoring
      maxTokens: Math.min(getModelInfo(provider, model).maxTokens, tutor ? 800 : 1000), // Shorter responses for tutoring
    });

    // Persist to DB
    let chatSession = sessionId
      ? await prisma.chatSession.findFirst({ where: { id: sessionId, userId: session.user.id } })
      : null;

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: { userId: session.user.id, provider, model, title: lastMessage.slice(0, 60) },
      });
    } else {
      await prisma.chatSession.update({ where: { id: chatSession.id }, data: { updatedAt: new Date() } });
    }

    await prisma.chatMessage.createMany({
      data: [
        { sessionId: chatSession.id, role: "user", content: lastMessage },
        { sessionId: chatSession.id, role: "assistant", content: reply, provider, model },
      ],
    });

    // Save provider/model to user preferences only if explicitly provided AND different from current
    if (reqProvider || reqModel) {
      const providerChanged = reqProvider && reqProvider !== userPrefs?.aiProvider;
      const modelChanged = reqModel && reqModel !== userPrefs?.aiModel;
      if (providerChanged || modelChanged) {
        await prisma.userPreferences.upsert({
          where: { userId: session.user.id },
          update: { ...(providerChanged && { aiProvider: reqProvider }), ...(modelChanged && { aiModel: reqModel }) },
          create: { userId: session.user.id, aiProvider: reqProvider, aiModel: reqModel },
        });
      }
    }

    return NextResponse.json({ reply, sessionId: chatSession.id });
  } catch (error) {
    // Enhanced error handling with provider fallback
    console.error(`AI generation error (${provider}:${model}):`, error);
    
    // Try fallback provider for tutoring if primary fails
    if (tutor && !reqProvider) {
      try {
        const fallbackProvider = provider === 'openrouter' ? 'groq' : 'openrouter';
        const fallbackModel = getOptimalTutoringModel(fallbackProvider, true);
        
        const fallbackReply = await generateChatCompletion({
          provider: fallbackProvider,
          model: fallbackModel,
          messages: trimmedMessages,
          temperature: 0.6,
          maxTokens: 800,
        });
        
        return NextResponse.json({ 
          reply: fallbackReply, 
          fallback: true,
          usedProvider: fallbackProvider,
          usedModel: fallbackModel
        });
      } catch (fallbackError) {
        console.error(`Fallback also failed:`, fallbackError);
      }
    }
    
    // Provide specific error messages
    let errorMessage = "Failed to generate response";
    if (error instanceof Error) {
      if (error.message.includes("apiKey") || error.message.includes("401")) {
        errorMessage = `${provider} API key not configured. Try switching providers in settings.`;
      } else if (error.message.includes("rate_limit") || error.message.includes("413")) {
        errorMessage = `Rate limit exceeded for ${provider}. Please try again in a moment or switch providers.`;
      } else if (error.message.includes("model") && error.message.includes("not found")) {
        errorMessage = `Model ${model} not available on ${provider}. Please select a different model.`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
