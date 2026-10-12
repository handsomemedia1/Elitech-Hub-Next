'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth';

export async function fetchPostsAction() {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: [], error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { data: [], error: 'No DB connection' };

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Posts fetch error:', error);
    return { data: [], error: error.message };
  }
  
  return { data: data || [], error: null };
}

export async function updatePostStatusAction(id: string, newStatus: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('blog_posts').update({ 
    status: newStatus,
    published: newStatus === 'published' 
  }).eq('id', id);

  if (error) {
    console.error('Update post status error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/posts');
  return { success: true };
}

export async function deletePostAction(id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);

  if (error) {
    console.error('Delete post error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/posts');
  return { success: true };
}
