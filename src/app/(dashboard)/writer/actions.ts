'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerWriter, getServerUser } from '@/lib/auth';

// 1. Dashboard Stats & Recent Posts
export async function getWriterDashboardAction() {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { error: 'DB Error' };

  // Fetch writer profile stats
  const { data: profile } = await supabase
    .from('writers')
    .select('posts_count, total_views, level, badges, name, bio, avatar_url, slug, is_public, display_name')
    .eq('id', writer.id)
    .single();


  // Fetch recent posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, status, views, created_at, published_at')
    .eq('writer_id', writer.id)
    .order('created_at', { ascending: false });

  // Calculate real stats
  const totalPosts = posts?.length || 0;
  const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
  const draftPosts = posts?.filter(p => p.status === 'draft').length || 0;
  const totalViews = posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

  return { 
    profile, 
    stats: { totalPosts, publishedPosts, draftPosts, totalViews },
    recentPosts: posts?.slice(0, 5) || [] 
  };
}

// 2. Fetch Writer's Posts (List)
export async function getWriterPostsAction() {
  const writer = await getServerWriter();
  if (!writer) return { data: [], error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { data: [], error: 'DB Error' };

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('writer_id', writer.id)
    .order('created_at', { ascending: false });

  return { data: data || [], error: error?.message };
}

// 3. Save Post (Draft or Publish)
export async function saveWriterPostAction(payload: any, postId?: string, clusterArticleId?: string) {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { error: 'DB Error' };

  // Force Ownership
  const safePayload = { ...payload };
  safePayload.writer_id = writer.id;
  safePayload.author = writer.display_name || writer.name;

  if (postId) {
    // Verify ownership before updating
    const { data: existing } = await supabase.from('blog_posts').select('writer_id').eq('id', postId).single();
    if (!existing || existing.writer_id !== writer.id) {
      return { error: 'Access denied: You do not own this post.' };
    }
    const { error } = await supabase.from('blog_posts').update(safePayload).eq('id', postId);
    if (error) return { error: error.message };
  } else {
    // Insert new
    const { data, error } = await supabase.from('blog_posts').insert([safePayload]).select('id').single();
    if (error) return { error: error.message };
    postId = data.id;
  }

  if (clusterArticleId && postId) {
    // We update the planner record. No strict RLS here since service_role, but we can trust clusterArticleId if passed from client, 
    // though to be completely safe, we should ensure the cluster belongs to the writer.
    // Instead of verifying here, we just update it where the article_id matches or it's empty, and the cluster is owned by the writer.
    // A simple query verifying writer ownership:
    const { data: ca } = await supabase.from('cluster_articles').select('id, content_clusters(writer_id)').eq('id', clusterArticleId).single();
    if (ca && ca.content_clusters && (ca.content_clusters as any).writer_id === writer.id) {
      await supabase.from('cluster_articles').update({
        article_id: postId,
        status: safePayload.status === 'published' ? 'PUBLISHED' : (safePayload.status === 'draft' ? 'DRAFT' : 'WRITING'),
        published_url: safePayload.status === 'published' ? `/${safePayload.slug}` : null
      }).eq('id', clusterArticleId);
    }
  }

  // Update writer posts count
  const { count } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('writer_id', writer.id);
  await supabase.from('writers').update({ posts_count: count || 0 }).eq('id', writer.id);

  // Log writing activity for productivity goals
  try {
    const { data: settings } = await supabase.from('writer_productivity_settings').select('timezone').eq('writer_id', writer.id).single();
    const tz = settings?.timezone || 'UTC';
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: tz }); 
    
    const { data: existingActivity } = await supabase
      .from('writer_activity_log')
      .select('id')
      .eq('writer_id', writer.id)
      .eq('activity_date', dateStr)
      .single();
    
    if (!existingActivity) {
      await supabase.from('writer_activity_log').insert({
        writer_id: writer.id,
        activity_date: dateStr,
        activity_type: safePayload.status === 'published' ? 'article_published' : 'article_edited',
        article_id: postId
      });
    }
  } catch (e) {
    console.error("Activity logging failed", e);
  }

  // Gamification check (First Article, 5 Articles, 10 Articles, etc.)
  await evaluateWriterAchievements(writer.id, supabase);

  revalidatePath('/writer');
  revalidatePath('/writer/posts');
  return { success: true, postId };
}

// Gamification Engine
export async function evaluateWriterAchievements(writerId: string, supabase: any) {
  const { data: writer } = await supabase.from('writers').select('posts_count, total_views, badges, level').eq('id', writerId).single();
  if (!writer) return;

  const currentBadges = writer.badges || [];
  const newBadges = [...currentBadges];
  let newLevel = writer.level || 'Newcomer';
  let awarded = false;

  const awardBadge = (badgeName: string) => {
    if (!newBadges.includes(badgeName)) {
      newBadges.push(badgeName);
      awarded = true;
    }
  };

  // Article Count Badges
  if (writer.posts_count >= 1) awardBadge('First Article');
  if (writer.posts_count >= 5) awardBadge('Prolific Writer (5+)');
  if (writer.posts_count >= 10) awardBadge('Expert Writer (10+)');
  if (writer.posts_count >= 50) awardBadge('Master Scribe (50+)');
  if (writer.posts_count >= 100) awardBadge('Legend (100+)');

  // Views Badges
  if (writer.total_views >= 100) awardBadge('100 Views Club');
  if (writer.total_views >= 1000) awardBadge('1K Views Club');
  if (writer.total_views >= 5000) awardBadge('5K Views Club');
  if (writer.total_views >= 10000) awardBadge('10K Views Club');

  // Level thresholds
  if (writer.posts_count >= 50 || writer.total_views >= 10000) newLevel = 'Elite Writer';
  else if (writer.posts_count >= 10 || writer.total_views >= 1000) newLevel = 'Senior Writer';
  else if (writer.posts_count >= 1) newLevel = 'Writer';

  if (awarded || newLevel !== writer.level) {
    await supabase.from('writers').update({ badges: newBadges, level: newLevel }).eq('id', writerId);
  }
}

export async function deleteWriterPostAction(postId: string) {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { error: 'DB Error' };

  // Verify ownership
  const { data: existing } = await supabase.from('blog_posts').select('writer_id').eq('id', postId).single();
  if (!existing || existing.writer_id !== writer.id) {
    return { error: 'Access denied: You do not own this post.' };
  }

  const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
  if (error) return { error: error.message };

  // Update writer posts count
  const { count } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('writer_id', writer.id);
  await supabase.from('writers').update({ posts_count: count || 0 }).eq('id', writer.id);

  revalidatePath('/writer/posts');
  revalidatePath('/writer');
  return { success: true };
}
