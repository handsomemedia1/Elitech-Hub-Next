import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
});

// gemini-1.5-flash was shut down by Google, which made every reply come back
// empty. Models are tried in order, each with a time limit, so one retired or
// overloaded model can't break or hang the chat. GEMINI_CHAT_MODEL overrides the first.
const CHAT_MODELS = [process.env.GEMINI_CHAT_MODEL || 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
const MODEL_TIMEOUT_MS = 12_000;

const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;
const FALLBACK_REPLY =
  "Sorry, I'm having trouble answering right now. Please email info@elitechub.com or WhatsApp +2347081968062 and the team will help you.";

type ChatMessage = { role: 'user' | 'assistant'; content: string };

/** Keep only recent user/assistant turns so clients can't inject a system prompt or send huge payloads. */
function cleanMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const cleaned = input
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  // The widget's canned greeting is an assistant message; Gemini expects the
  // conversation to open with a user turn, so drop any leading assistant turns.
  while (cleaned.length && cleaned[0].role === 'assistant') cleaned.shift();
  return cleaned;
}

/** The same summary AI crawlers read in /llms.txt, so the bot and the web agree. */
let knowledgeCache: string | null = null;
async function getKnowledge(): Promise<string> {
  if (knowledgeCache !== null) return knowledgeCache;
  try {
    knowledgeCache = await readFile(path.join(process.cwd(), 'public', 'llms.txt'), 'utf8');
  } catch {
    knowledgeCache = '';
  }
  return knowledgeCache;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`chat:${ip}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many messages. Please try again in a few minutes.' }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const messages = cleanMessages(body?.messages);
    if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Send at least one user message.' }, { status: 400 });
    }

    // Fetch authoritative prices from Supabase (bypassing client-provided prices)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // We fetch the base NGN prices for the chatbot as the anchor
    const { data: prices } = await supabaseAdmin
      .from('course_prices')
      .select('course_id, amount')
      .eq('currency_code', 'NGN')
      .eq('active', true)
      .in('course_id', ['ai_training', 'ai_security', 'professional']);

    let aiTrainingPrice = '₦100,000';
    let aiSecurityPrice = '₦200,000';
    let professionalPrice = '₦350,000';

    if (prices) {
      const ait = prices.find(p => p.course_id === 'ai_training');
      if (ait) aiTrainingPrice = `₦${ait.amount.toLocaleString()}`;

      const ais = prices.find(p => p.course_id === 'ai_security');
      if (ais) aiSecurityPrice = `₦${ais.amount.toLocaleString()}`;

      const prof = prices.find(p => p.course_id === 'professional');
      if (prof) professionalPrice = `₦${prof.amount.toLocaleString()}`;
    }

    const dynamicPrompt = `You are Elitech Hub's friendly AI Admissions Counselor. 
Your goal is to answer questions about our training programmes and digital services, and encourage the user to apply.

Official Active Programmes:
1. AI-Powered Cybersecurity Programme (6 Weeks): Fundamentals of cybersecurity, Python, PowerShell, Linux, and autonomous AI systems. Cost: ${aiTrainingPrice}. 100% virtual live.
2. AI Security and Reverse Vulnerability (8 Weeks): Advanced vulnerability research, reverse engineering, binary analysis, LLM defenses. Cost: ${aiSecurityPrice}. 100% virtual live.
3. 16-Week Professional Cybersecurity Programme: Comprehensive career training, advanced hands-on labs, 1-on-1 mentorship, unpaid internship experience. Cost: ${professionalPrice}. 100% virtual live. Split payments allowed (Maximum of exactly 2 installments).
Note: The traditional general bootcamp is retired and upgraded into the AI-Powered Cybersecurity Programme.

Tone: Professional, highly encouraging, enthusiastic. Use emojis sparingly.

CRITICAL RULES:
- Never offer discounts. 
- State explicitly that all payments are strictly NON-REFUNDABLE.
- NEVER promise job placement or employment. We offer an unpaid internship experience only.
- Keep responses under 3 sentences. Be friendly, slightly edgy (hacker vibe).
- If asked about contacting humans, tell them to email info@elitechub.com or use WhatsApp +2347081968062.
- If they ask for something you don't know, tell them to use the Contact form.`;

    const knowledge = await getKnowledge();
    const systemPrompt = knowledge
      ? `${dynamicPrompt}\n\nReference facts about Elitech Hub (prices above take priority over any price here):\n${knowledge}`
      : dynamicPrompt;

    // The Chatbot component reads lines prefixed with "0:" (Vercel AI data stream format)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (text: string) => controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
        let sentText = false;

        for (const modelId of CHAT_MODELS) {
          // Model errors (retired model, quota, bad key) don't throw from
          // textStream; they only reach onError, leaving the stream empty.
          const result = streamText({
            model: google(modelId),
            system: systemPrompt,
            messages,
            temperature: 0.7,
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
            onError: ({ error }) => {
              console.error(`[chat] ${modelId} failed:`, error);
            },
          });
          try {
            for await (const chunk of result.textStream) {
              if (chunk) sentText = true;
              send(chunk);
            }
          } catch (e) {
            console.error(`[chat] ${modelId} stream error:`, e);
          }
          if (sentText) break;
        }

        // Never leave the visitor with a blank bubble.
        if (!sentText) send(FALLBACK_REPLY);
        controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Chat API Error:', errorMsg);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

