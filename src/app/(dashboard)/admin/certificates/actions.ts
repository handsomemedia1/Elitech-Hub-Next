'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { getServerUser } from '@/lib/auth';

export async function fetchCertificateCountAction() {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { count: 0, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { count: 0, error: 'No DB connection' };

  const { count, error } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Certificate count fetch error:', error);
    return { count: 0, error: error.message };
  }
  
  return { count: count || 0, error: null };
}

export async function saveCertificateAction(data: any, id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('certificates').insert([
    {
      certificate_id: id,
      user_name: data.name,
      course_title: data.role,
      issued_at: new Date(data.date).toISOString()
    }
  ]);

  if (error && error.code !== '23505') { 
    console.error('Failed to save to verification DB:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, error: null };
}
