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
  const { data: appsData } = await supabase.from('applications').select('*').order('created_at', { ascending: false });

  // Fetch Leads
  const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    
  // Fetch Messages (Contact Us)
  const { data: messagesData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });

  // Fetch Volunteer Applications
  const { data: volunteerData } = await supabase.from('volunteer_applications').select('*').order('created_at', { ascending: false });

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

  const formattedMessages = (messagesData || []).map(msg => ({
    id: `msg_${msg.id}`,
    original_id: msg.id,
    full_name: msg.name,
    email: msg.email,
    phone_number: msg.phone || '',
    program_name: `Contact Us: ${msg.program_interest || 'General'}`,
    status: 'pending',
    created_at: msg.created_at,
    is_lead: true
  }));

  const formattedVolunteers = (volunteerData || []).map(vol => ({
    id: `vol_${vol.id}`,
    original_id: vol.id,
    full_name: vol.full_name,
    email: vol.email,
    phone_number: vol.phone_number || '',
    program_name: `Volunteer: ${vol.role || 'General'}`,
    status: vol.status || 'pending',
    created_at: vol.created_at,
    is_lead: true // treat as read-only or fake-status in UI for now
  }));

  const merged = [...(appsData || []), ...formattedLeads, ...formattedMessages, ...formattedVolunteers].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return { data: merged, error: null };
}

export async function updateApplicationStatusAction(id: string, status: string) {
  const user = await getServerUser();
  if (!user || user.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const supabase = createServiceClient();
  if (!supabase) return { success: false, error: 'No DB connection' };

  // For real applications
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
