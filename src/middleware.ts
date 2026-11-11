import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware
 * - Bot/scanner user-agent blocking (production only)
 * - Security headers (CSP, CORS for API routes)
 * - Basic rate-limit signalling (enforced properly in route handlers)
 */

const BLOCKED_AGENTS = [
  'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab',
  'libwww-perl', 'python-requests', 'go-http-client',
  'java/', 'wget',
];

// Only block curl/postman in production so development stays easy
const PROD_ONLY_BLOCKED = ['curl', 'postmanruntime'];

const IS_PROD = process.env.NODE_ENV === 'production';

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent')?.toLowerCase() || '';
  const path = request.nextUrl.pathname;

  // ── Bot blocking ───────────────────────────────────────────────
  const alwaysBlock = BLOCKED_AGENTS.some(agent => ua.includes(agent));
  const prodBlock   = IS_PROD && PROD_ONLY_BLOCKED.some(agent => ua.includes(agent));

  if (alwaysBlock || prodBlock) {
    return new NextResponse('Access Denied.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const response = NextResponse.next();

  // ── Visitor country for local pricing ──────────────────────────
  // PricingContext reads `detected_country` to show prices in the visitor's
  // currency, but nothing was setting it, so every visitor saw naira while
  // checkout charged overseas visitors in dollars. Taken from the edge
  // headers the checkout itself trusts.
  if (!path.startsWith('/api/')) {
    const country = (request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || '')
      .trim()
      .toUpperCase();
    if (/^[A-Z]{2}$/.test(country) && country !== 'XX' && request.cookies.get('detected_country')?.value !== country) {
      response.cookies.set('detected_country', country, {
        path: '/',
        maxAge: 60 * 60 * 24,
        sameSite: 'lax',
        secure: IS_PROD,
      });
    }
  }

  // ── Security headers (applied to every route) ──────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (IS_PROD) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // ── Content Security Policy ────────────────────────────────────
  // Only set CSP on pages (not on API routes, which don't serve HTML)
  if (!path.startsWith('/api/')) {
      const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://widget.senja.io https://cdn.trustpilot.com https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://static.cloudflareinsights.com https://*.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://i.ytimg.com https://lh3.googleusercontent.com https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net https://*.clarity.ms https://c.bing.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://cloudflareinsights.com https://*.clarity.ms",
      "frame-src https://www.youtube.com https://www.linkedin.com https://widget.senja.io https://www.trustpilot.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }

  // ── CORS for API routes ────────────────────────────────────────
  if (path.startsWith('/api/')) {
    const origin = request.headers.get('origin') || '';
    const allowed = IS_PROD
      ? ['https://www.elitechub.com', 'https://www.elitechub.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

    if (!origin || allowed.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // ── Route Protection (Basic Cookie Check) ──────────────────────
  // The actual crypto validation happens in Server Components / API routes.
  // This just ensures unauthenticated users are bounced early.
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!request.cookies.has('elitech_token')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  if ((path === '/writer' || path.startsWith('/writer/')) && !path.startsWith('/writer/login') && !path.startsWith('/writer/signup')) {
    if (!request.cookies.has('elitech_token')) {
      return NextResponse.redirect(new URL('/writer/login', request.url));
    }
  }

  // Only the researcher dashboard is private. A plain startsWith('/researcher')
  // also matched /researcher-guidelines and public /researcher/[slug] profiles.
  const RESEARCHER_DASHBOARD = ['/researcher/profile', '/researcher/submissions', '/researcher/submit'];
  const isResearcherDashboard =
    path === '/researcher' ||
    RESEARCHER_DASHBOARD.some(p => path === p || path.startsWith(`${p}/`));
  if (isResearcherDashboard) {
    if (!request.cookies.has('elitech_token')) {
      return NextResponse.redirect(new URL('/researcher/login', request.url));
    }
  }

  return response;
}

export const config = {
  // Apply to ALL routes including /api/*
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
