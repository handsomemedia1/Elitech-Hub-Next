import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

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

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      messages: [
        { role: 'system', content: dynamicPrompt },
        ...(messages as Array<{ role: 'user' | 'assistant'; content: string }>),
      ],
      temperature: 0.7,
    });

    // ai v7 compatible: stream raw text chunks as a plain text stream
    // The Chatbot component reads lines prefixed with "0:" (Vercel AI data stream format)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.textStream) {
            // Encode as Vercel AI SDK data stream format: 0:"text chunk"\n
            const line = `0:${JSON.stringify(chunk)}\n`;
            controller.enqueue(encoder.encode(line));
          }
          // Send finish signal
          controller.enqueue(encoder.encode('d:{"finishReason":"stop"}\n'));
        } catch (e) {
          controller.error(e);
        } finally {
          controller.close();
        }
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
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: errorMsg }, { status: 500 });
  }
}

