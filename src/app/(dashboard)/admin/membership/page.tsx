'use client';

import React, { useState, useEffect } from 'react';
import { createServiceClient } from '@/lib/supabase-server'; // Note: Should be client if client-side or server action
import { supabase } from '@/lib/supabase';
// removed date-fns
import { Mail, Briefcase, FileText, Search, Filter } from 'lucide-react';

type Application = {
  id: string;
  full_name: string;
  email: string;
  professional_title: string;
  institution: string;
  status: string;
  created_at: string;
};

export default function MembershipApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('research_membership_applications')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('research_membership_applications')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      setApplications(apps => 
        apps.map(app => app.id === id ? { ...app, status } : app)
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Membership Applications</h1>
        <div className="text-gray-400">
          Total: {applications.length}
        </div>
      </div>

      <div className="bg-[#111317] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a1d24] text-gray-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Applicant</th>
              <th className="p-4 font-medium">Institution</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {applications.map((app) => (
              <tr key={app.id} className="text-gray-300 hover:bg-[#161b22] transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-white">{app.full_name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Mail size={12} /> {app.email}
                  </div>
                </td>
                <td className="p-4">
                  <div>{app.institution || '—'}</div>
                  <div className="text-sm text-gray-500">{app.professional_title}</div>
                </td>
                <td className="p-4">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <select 
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="bg-[#0a0c10] border border-gray-700 text-sm rounded-md px-2 py-1 focus:ring-1 focus:ring-red-500 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Waitlisted">Waitlisted</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td className="p-4 text-right">
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No applications received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
