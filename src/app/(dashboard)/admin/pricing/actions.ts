'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth';

export async function fetchPricingAction() {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: [], error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { data: [], error: 'No DB connection' };

  const { data, error } = await supabase
    .from('course_prices')
    .select('*')
    .order('course_id')
    .order('currency');

  if (error) {
    console.error('Pricing fetch error:', error);
    return { data: [], error: error.message };
  }
  
  return { data: data || [], error: null };
}

export async function createPricingAction(priceData: any) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('course_prices').insert([priceData]);

  if (error) {
    console.error('Create pricing error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/pricing');
  return { success: true };
}

export async function updatePricingAction(id: string, amount: number) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('course_prices').update({ amount }).eq('id', id);

  if (error) {
    console.error('Update pricing error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/pricing');
  return { success: true };
}

export async function deletePricingAction(id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase.from('course_prices').delete().eq('id', id);

  if (error) {
    console.error('Delete pricing error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/pricing');
  return { success: true };
}
