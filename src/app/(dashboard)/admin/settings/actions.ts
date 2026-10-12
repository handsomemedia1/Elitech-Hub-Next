'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth';

export async function fetchSiteSettingAction(key: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: null, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { data: null, error: 'No DB connection' };

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('setting_key', key)
    .single();

  return { data, error: error?.message || null };
}

export async function upsertSiteSettingAction(key: string, value: any) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .eq('setting_key', key)
    .single();

  let error;
  if (existing) {
    const res = await supabase.from('site_settings').update({ setting_value: value }).eq('setting_key', key);
    error = res.error;
  } else {
    const res = await supabase.from('site_settings').insert([{ setting_key: key, setting_value: value }]);
    error = res.error;
  }

  if (error) {
    console.error('Site settings upsert error:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/settings');
  return { success: true };
}
