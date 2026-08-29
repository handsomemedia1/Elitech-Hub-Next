/**
 * POST /api/auth/login
 * Mirrors old backend auth.js /login route
 */
export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceClient } from '@/lib/supabase-server';
import { validateEmail } from '@/lib/validators';
import { signToken } from '@/lib/auth';
import { authLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // ── Rate limit: 5 attempts / 15 min ───────────────────────────
  const ip = getClientIp(request);
  const limit = authLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // ── Basic validation ───────────────────────────────────────────
  const emailResult = validateEmail(body.email);
  if (!emailResult.valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

  if (!body.password || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });

  // ── Fetch user ─────────────────────────────────────────────────
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, password_hash, has_access, role, country, token_version')
    .eq('email', emailResult.value)
    .single();

  // Use generic message to prevent email enumeration
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // ── Verify password ────────────────────────────────────────────
  const valid = await bcrypt.compare(body.password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    tokenVersion: user.token_version ?? 0,
  });

  const response = NextResponse.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      has_access: user.has_access,
      role: user.role,
    },
    token,
  });

  // Set secure HttpOnly cookie for server-side authentication
  response.cookies.set('elitech_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return response;
}
