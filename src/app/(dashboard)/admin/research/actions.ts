'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth';

export async function submitResearchAction(paperData: any, doi: string | null) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: null, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { data: null, error: 'No DB connection' };

  const { data, error } = await supabase.from('research').insert([paperData]).select();
  
  if (error) {
    console.error('Research submit error:', error);
    return { data: null, error: error.message };
  }

  if (data && data.length > 0 && doi) {
    const { error: doiError } = await supabase.from('research_identifiers').insert([
      { research_id: data[0].id, identifier_type: 'DOI', identifier_value: doi }
    ]);
    if (doiError) {
      console.error('DOI insert error:', doiError);
    }
  }

  revalidatePath('/admin/lab');
  revalidatePath('/research');
  return { data, error: null };
}
