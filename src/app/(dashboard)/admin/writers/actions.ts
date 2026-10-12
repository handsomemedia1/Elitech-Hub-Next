'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth';

// 1. Fetch Writers
export async function fetchWritersAction() {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: [], error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { data: [], error: 'No DB connection' };

  const { data, error } = await supabase
    .from('writers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Writers fetch error:', error);
    return { data: [], error: error.message };
  }

  // Also fetch post counts if needed, but for simplicity let's join or do a separate query
  const { data: posts } = await supabase.from('blog_posts').select('writer_id');
  
  let finalWriters = data || [];
  if (posts) {
    finalWriters = finalWriters.map(writer => {
      const writerPosts = posts.filter(p => p.writer_id === writer.id);
      return {
        ...writer,
        posts_count: writerPosts.length,
        total_views: 0 // Mocked views for now
      };
    });
  }

  return { data: finalWriters, error: null };
}

// 2. Add Writer
export async function addWriterAction(writerData: any) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('writers').insert([writerData]);

  if (error) {
    console.error('Add writer error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/writers');
  return { success: true };
}

// 3. Update Writer Status
export async function updateWriterStatusAction(id: string, status: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('writers').update({ status }).eq('id', id);

  if (error) {
    console.error('Update writer status error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/writers');
  return { success: true };
}

// 4. Delete Writer
export async function deleteWriterAction(id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('writers').delete().eq('id', id);

  if (error) {
    console.error('Delete writer error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/writers');
  return { success: true };
}
