'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth';

export async function fetchCoursesAction() {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: [], error: 'Unauthorized' };
  const supabase = createServiceClient();
  if (!supabase) return { data: [], error: 'No DB connection' };
  const { data, error } = await supabase.from('courses').select('*, modules(count)').order('created_at', { ascending: false });
  return { data: data || [], error: error?.message || null };
}

export async function fetchCourseAction(id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: null, error: 'Unauthorized' };
  const supabase = createServiceClient();
  if (!supabase) return { data: null, error: 'No DB connection' };
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
  return { data, error: error?.message || null };
}

export async function fetchCourseModulesAction(courseId: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: [], error: 'Unauthorized' };
  const supabase = createServiceClient();
  if (!supabase) return { data: [], error: 'No DB connection' };
  const { data, error } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order_index', { ascending: true });
  return { data: data || [], error: error?.message || null };
}

export async function createCourseAction(courseData: any) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: null, error: 'Unauthorized' };
  const supabase = createServiceClient();
  if (!supabase) return { data: null, error: 'No DB connection' };
  const { data, error } = await supabase.from('courses').insert([courseData]).select().single();
  revalidatePath('/admin/courses');
  return { data, error: error?.message || null };
}

export async function updateCourseAction(id: string, courseData: any) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };
  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };
  const { error } = await supabase.from('courses').update(courseData).eq('id', id);
  revalidatePath('/admin/courses');
  return { success: !error, error: error?.message || null };
}

export async function deleteCourseAction(id: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };
  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };
  const { error } = await supabase.from('courses').delete().eq('id', id);
  revalidatePath('/admin/courses');
  return { success: !error, error: error?.message || null };
}
