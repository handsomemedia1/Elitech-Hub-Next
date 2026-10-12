'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth';

export async function fetchApplicationsAction() {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { data: [], error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { data: [], error: 'No DB connection' };

  // Fetch Applications
  const { data: appsData, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (appsError) {
    console.error('Applications fetch error:', appsError);
  }

  // Fetch Leads
  const { data: leadsData, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (leadsError) {
    console.error('Leads fetch error:', leadsError);
  }

  const formattedLeads = (leadsData || []).map(lead => ({
    id: `lead_${lead.id}`,
    original_id: lead.id,
    full_name: lead.name || 'Newsletter Lead',
    email: lead.email,
    phone_number: lead.whatsapp || '',
    program_name: `Lead Source: ${lead.source_page || 'popup'}`,
    status: 'pending',
    created_at: lead.created_at,
    is_lead: true
  }));

  const merged = [...(appsData || []), ...formattedLeads].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { data: merged, error: null };
}

export async function updateApplicationStatusAction(id: string, status: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Update application error:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/applications');
  return { success: true };
}
