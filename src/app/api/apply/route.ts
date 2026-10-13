/**
 * POST /api/apply
 * Handles bootcamp applications — mirrors old applications.js
 */
export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { validateEmail, validateField, sanitizeText } from '@/lib/validators';
import { sendApplicationConfirmation, sendApplicationNotification } from '@/lib/email';
import { formLimit, getClientIp } from '@/lib/rate-limit';

const PROGRAMS_FALLBACK: Record<string, { name: string; courseId: string; defaultPrice: number }> = {
  // Active programmes
  'ai_training':          { name: 'AI-Powered Cybersecurity Programme', courseId: 'ai_training', defaultPrice: 100000 },
  'ai_security':          { name: 'AI Security and Reverse Vulnerability', courseId: 'ai_security', defaultPrice: 200000 },
  'professional':         { name: '16-Week Professional Cybersecurity Programme', courseId: 'professional', defaultPrice: 350000 },
  // Human-readable form option values
  'AI-Powered Cybersecurity': { name: 'AI-Powered Cybersecurity Programme', courseId: 'ai_training', defaultPrice: 100000 },
  'AI Security and Reverse Vulnerability': { name: 'AI Security and Reverse Vulnerability', courseId: 'ai_security', defaultPrice: 200000 },
  '16-Week Professional': { name: '16-Week Professional Cybersecurity Programme', courseId: 'professional', defaultPrice: 350000 },
  // Legacy: retained for historical application records only (bootcamp was retired Oct 2026)
  'bootcamp':             { name: '6-Week Cybersecurity Bootcamp', courseId: 'bootcamp', defaultPrice: 100000 },
  '6-Week Bootcamp':      { name: '6-Week AI Cybersecurity Bootcamp', courseId: 'bootcamp', defaultPrice: 100000 },
  'Not Sure Yet': { name: 'General Inquiry', courseId: '', defaultPrice: 0 },
};

export async function POST(request: Request) {
  // ── Rate limiting ──────────────────────────────────────────────
  const ip = getClientIp(request);
  const limit = formLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // ── Parse body ─────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // ── Validate required fields ───────────────────────────────────
  const nameResult = validateField(body.fullName, 'Full Name', 100);
  if (!nameResult.valid) return NextResponse.json({ error: nameResult.error }, { status: 400 });

  const emailResult = validateEmail(body.email);
  if (!emailResult.valid) return NextResponse.json({ error: emailResult.error }, { status: 400 });

  const phoneResult = validateField(body.phone, 'Phone Number', 30);
  if (!phoneResult.valid) return NextResponse.json({ error: phoneResult.error }, { status: 400 });

  const programRaw = sanitizeText(body.program);
  if (!programRaw) return NextResponse.json({ error: 'Program selection is required' }, { status: 400 });

  // ── Resolve program details ────────────────────────────────────
  const programDetails = PROGRAMS_FALLBACK[programRaw] ?? { name: programRaw, courseId: '', defaultPrice: 0 };

  // Optional fields
  const country    = sanitizeText(body.country).slice(0, 50) || null;
  const city       = sanitizeText(body.city).slice(0, 100) || null;
  const source     = sanitizeText(body.source).slice(0, 100) || null;
  const skillLevel = sanitizeText(body.skillLevel).slice(0, 100) || null;
  const motivation = sanitizeText(body.motivation).slice(0, 3000) || null;

  // ── Persist to Supabase ────────────────────────────────────────
  let applicationId: string | null = null;
  const supabase = createServiceClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        program: programRaw,
        program_name: programDetails.name,
        full_name: nameResult.value,
        email: emailResult.value,
        phone: phoneResult.value,
        country,
        city,
        source,
        skill_level: skillLevel,
        motivation,
        status: 'pending',
        created_at: new Date().toISOString(),
      }])
      .select('id')
      .single();

    if (error) {
      console.error('[Apply] DB insert error:', error.message);
    } else {
      applicationId = data?.id ?? null;
    }
  }

  // ── Send emails (Safe settlement: failure never aborts application submission) ──
  const emailResults = await Promise.allSettled([
    sendApplicationConfirmation({
      to: emailResult.value,
      name: nameResult.value,
      program: programDetails.name,
    }),
    sendApplicationNotification({
      applicantName: nameResult.value,
      email: emailResult.value,
      phone: phoneResult.value,
      program: programDetails.name,
      country: country ?? 'N/A',
      city: city ?? 'N/A',
      skillLevel: skillLevel ?? 'N/A',
      motivation: motivation ?? 'N/A',
      source: source ?? 'N/A',
    }),
  ]);

  for (const result of emailResults) {
    if (result.status === 'rejected') {
      console.warn('[Apply] Email delivery rejected:', result.reason);
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Application submitted successfully',
    applicationId,
    program: programDetails.name,
  });
}
