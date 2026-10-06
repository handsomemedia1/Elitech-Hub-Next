'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { getServerWriter } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getProductivitySettingsAction() {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('writer_productivity_settings')
    .select('*')
    .eq('writer_id', writer.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { error: 'Failed to fetch productivity settings.' };
  }

  return { data: data || { weekly_target: 2, preferred_days: [], reminder_time: '09:00:00', timezone: 'UTC' } };
}

export async function saveProductivitySettingsAction(settings: { weekly_target: number; preferred_days: string[]; reminder_time: string; timezone: string }) {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('writer_productivity_settings')
    .upsert({
      writer_id: writer.id,
      weekly_target: settings.weekly_target,
      preferred_days: settings.preferred_days,
      reminder_time: settings.reminder_time,
      timezone: settings.timezone,
      updated_at: new Date().toISOString()
    }, { onConflict: 'writer_id' });

  if (error) {
    return { error: 'Failed to save productivity settings.' };
  }

  revalidatePath('/writer/productivity');
  return { success: true };
}

export async function getWeeklyActivityAction() {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  
  // Get timezone
  const { data: settings } = await supabase.from('writer_productivity_settings').select('timezone').eq('writer_id', writer.id).single();
  const tz = settings?.timezone || 'UTC';

  let localDate;
  try {
    localDate = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  } catch (e) {
    localDate = new Date();
  }

  // Get start of current week (Monday) in writer's timezone
  const day = localDate.getDay();
  const diff = localDate.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(localDate.setDate(diff));
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  const startOfWeekStr = `${startOfWeek.getFullYear()}-${pad(startOfWeek.getMonth()+1)}-${pad(startOfWeek.getDate())}`;
  
  const { data, error } = await supabase
    .from('writer_activity_log')
    .select('*')
    .eq('writer_id', writer.id)
    .gte('activity_date', startOfWeekStr);

  if (error) {
    return { error: 'Failed to fetch activity.' };
  }

  return { data: data || [] };
}
