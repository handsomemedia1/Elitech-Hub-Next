'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { getServerUser } from '@/lib/auth';

export async function fetchAdminStatsAction() {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { stats: null, applications: [], error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { stats: null, applications: [], error: 'No DB connection' };

  const [
    { count: usersCount },
    { count: paidCount },
    { count: coursesCount },
    { count: writersCount },
    { data: apps, count: appsCount }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('has_access', true),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('writers').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(5)
  ]);

  return {
    stats: {
      totalUsers: usersCount || 0,
      paidUsers: paidCount || 0,
      courses: coursesCount || 0,
      applications: appsCount || 0,
      writers: writersCount || 0,
    },
    applications: apps || [],
    error: null
  };
}
