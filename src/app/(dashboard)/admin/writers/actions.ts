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

// Helper: generate a URL-safe slug from a name
function slugify(text: string): string {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// 2. Add Writer
export async function addWriterAction(writerData: any) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  // Auto-generate a unique slug from the writer's name
  let slug: string | null = null;
  const nameForSlug = writerData.name || writerData.display_name;
  if (nameForSlug) {
    let base = slugify(nameForSlug);
    // Check uniqueness — add a random suffix if taken
    const { data: existing } = await supabase
      .from('writers')
      .select('id')
      .eq('slug', base)
      .maybeSingle();
    if (existing) {
      base = `${base}-${Math.floor(Math.random() * 9000) + 1000}`;
    }
    slug = base;
  }

  const { error } = await supabase.from('writers').insert([{
    ...writerData,
    slug,
    // Ensure the writer is not accidentally public until approved
    is_public: writerData.status === 'approved' ? (writerData.is_public ?? false) : false,
  }]);

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

  // SOFT DELETE: Deactivate and mark as deleted, preserving historical articles
  const { error } = await supabase.from('writers').update({ 
    status: 'suspended',
    active: false,
    banned: true 
  }).eq('id', id);

  if (error) {
    console.error('Delete writer error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/writers');
  return { success: true };
}
