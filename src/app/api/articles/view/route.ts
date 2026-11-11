import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|preview|monitor/i;

/**
 * Counts one read of an article (sent by ViewTracker when an article opens).
 * This file was empty, so read counts never went up. Each visitor is counted
 * at most once per article every six hours, and known bots are ignored.
 */
export async function POST(request: Request) {
  let body: { postId?: unknown; writerId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ counted: false }, { status: 400 });
  }

  const postId = typeof body.postId === 'string' ? body.postId : '';
  const writerId = typeof body.writerId === 'string' && UUID_RE.test(body.writerId) ? body.writerId : null;
  if (!UUID_RE.test(postId)) {
    return NextResponse.json({ counted: false }, { status: 400 });
  }

  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT_RE.test(ua)) {
    return NextResponse.json({ counted: false });
  }

  // One read per visitor per article per 6 hours; refreshes don't inflate counts.
  const ip = getClientIp(request);
  if (!rateLimit(`view:${ip}:${postId}`, 1, 6 * 60 * 60 * 1000).allowed) {
    return NextResponse.json({ counted: false });
  }
  // Overall cap per visitor, so a script can't pump numbers.
  if (!rateLimit(`views-total:${ip}`, 60, 60 * 60 * 1000).allowed) {
    return NextResponse.json({ counted: false }, { status: 429 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ counted: false }, { status: 503 });
  }

  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, views, writer_id, published')
    .eq('id', postId)
    .maybeSingle();
  if (!post || !post.published) {
    return NextResponse.json({ counted: false }, { status: 404 });
  }

  const { error } = await supabase
    .from('blog_posts')
    .update({ views: (post.views || 0) + 1 })
    .eq('id', postId);
  if (error) {
    console.error('[articles/view] Failed to count read:', error.message);
    return NextResponse.json({ counted: false }, { status: 500 });
  }

  // Keep the writer's running total in step, for their dashboard.
  const authorId = post.writer_id || writerId;
  if (authorId) {
    const { data: writer } = await supabase.from('writers').select('total_views').eq('id', authorId).maybeSingle();
    if (writer) {
      await supabase
        .from('writers')
        .update({ total_views: (writer.total_views || 0) + 1 })
        .eq('id', authorId);
    }
  }

  return NextResponse.json({ counted: true });
}
