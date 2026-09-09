'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Star, Link as LinkIcon, Check, X, ShieldAlert, Plus, Copy } from 'lucide-react';

type Testimonial = {
  id: string;
  source: string;
  author_name: string;
  author_role: string;
  organization: string;
  quote: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  featured: boolean;
  author_type: string;
  created_at: string;
};

type CollectionRequest = {
  id: string;
  token: string;
  recipient_name: string;
  recipient_email: string;
  relationship_type: string;
  context: string;
  status: 'active' | 'submitted' | 'expired' | 'revoked';
  created_at: string;
};

const RELATIONSHIP_TYPES = [
  'Client', 'Student', 'Research Collaborator', 'Professor / Academic', 
  'Mentor', 'Colleague', 'Employer', 'Project Collaborator', 
  'Training Participant', 'Community Member', 'Other'
];

export default function AdminTestimonialsPage() {
  const [activeTab, setActiveTab] = useState<'testimonials' | 'links'>('testimonials');
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [collectionRequests, setCollectionRequests] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // New Request Form State
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newReqName, setNewReqName] = useState('');
  const [newReqEmail, setNewReqEmail] = useState('');
  const [newReqRel, setNewReqRel] = useState('Client');
  const [newReqContext, setNewReqContext] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testRes, reqRes] = await Promise.all([
        supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        supabase.from('testimonial_collection_requests').select('*').order('created_at', { ascending: false })
      ]);
        
      if (testRes.error) throw testRes.error;
      if (reqRes.error) throw reqRes.error;
      
      // Fallback mapping in case migration hasn't run yet
      const mappedTestimonials = (testRes.data || []).map(t => ({
        ...t,
        status: t.status || (t.is_published ? 'approved' : 'pending')
      }));

      setTestimonials(mappedTestimonials);
      setCollectionRequests(reqRes.data || []);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      setTestimonials(items => items.map(item => item.id === id ? { ...item, status: newStatus as any } : item));
    } catch (err) {
      alert(`Failed to update status`);
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ featured: !currentValue })
        .eq('id', id);
        
      if (error) throw error;
      setTestimonials(items => items.map(item => item.id === id ? { ...item, featured: !currentValue } : item));
    } catch (err) {
      alert(`Failed to update featured state`);
    }
  };

  const createCollectionRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqName) return;
    
    try {
      const { data, error } = await supabase
        .from('testimonial_collection_requests')
        .insert([{
          recipient_name: newReqName,
          recipient_email: newReqEmail,
          relationship_type: newReqRel,
          context: newReqContext,
          status: 'active'
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      setCollectionRequests([data, ...collectionRequests]);
      setShowNewRequestForm(false);
      setNewReqName('');
      setNewReqEmail('');
      setNewReqContext('');
      
    } catch (err) {
      alert('Failed to create request');
      console.error(err);
    }
  };

  const revokeRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonial_collection_requests')
        .update({ status: 'revoked' })
        .eq('id', id);
        
      if (error) throw error;
      setCollectionRequests(items => items.map(item => item.id === id ? { ...item, status: 'revoked' } : item));
    } catch (err) {
      alert('Failed to revoke request');
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/testimonials/collect/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="p-8 text-white">Loading data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" /> Testimonial Management
          </h1>
          <p className="text-gray-400 mt-2">Manage reviews and generate secure collection links.</p>
        </div>
        
        <div className="flex bg-[#1a1d24] p-1 rounded-lg border border-gray-800">
          <button 
            onClick={() => setActiveTab('testimonials')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'testimonials' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Reviews
          </button>
          <button 
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'links' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Collection Links
          </button>
        </div>
      </div>

      {activeTab === 'testimonials' && (
        <div className="bg-[#111317] border border-gray-800 rounded-xl overflow-x-auto shadow-xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#1a1d24] text-gray-400 text-sm uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-medium">Author</th>
                <th className="p-4 font-medium w-1/3">Quote</th>
                <th className="p-4 font-medium text-center">Source</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-center">Featured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {testimonials.map((t) => (
                <tr key={t.id} className="text-gray-300 hover:bg-[#161b22] transition-colors">
                  <td className="p-4 align-top">
                    <div className="font-semibold text-white">{t.author_name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t.author_role} {t.organization ? `@ ${t.organization}` : ''}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 mt-2">
                      {t.rating || 5} <Star size={12} fill="currentColor" />
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <p className="text-sm text-gray-400 line-clamp-3 italic">"{t.quote}"</p>
                  </td>
                  <td className="p-4 align-top text-center">
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded capitalize">
                      {t.source}
                    </span>
                  </td>
                  <td className="p-4 align-top text-center">
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border transition-colors outline-none cursor-pointer
                        ${t.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/30' : ''}
                        ${t.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : ''}
                        ${t.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/30' : ''}
                        ${t.status === 'archived' ? 'bg-gray-500/10 text-gray-400 border-gray-500/30' : ''}
                      `}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="p-4 align-top text-center">
                    <button 
                      onClick={() => toggleFeatured(t.id, t.featured)}
                      className={`p-1.5 rounded transition-colors inline-block ${
                        t.featured 
                          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                          : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                      }`}
                      title={t.featured ? "Remove from Featured" : "Add to Featured"}
                    >
                      <Star size={18} fill={t.featured ? "currentColor" : "none"} />
                    </button>
                  </td>
                </tr>
              ))}
              {testimonials.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                    <ShieldAlert size={48} className="mb-4 opacity-20" />
                    No testimonials found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'links' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Collection Requests</h2>
            <button 
              onClick={() => setShowNewRequestForm(!showNewRequestForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> New Request
            </button>
          </div>

          {showNewRequestForm && (
            <form onSubmit={createCollectionRequest} className="bg-[#1a1d24] border border-gray-800 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Generate Collection Link</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Name *</label>
                  <input type="text" required value={newReqName} onChange={e => setNewReqName(e.target.value)} className="w-full bg-[#111317] border border-gray-700 rounded-md px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Email (Optional)</label>
                  <input type="email" value={newReqEmail} onChange={e => setNewReqEmail(e.target.value)} className="w-full bg-[#111317] border border-gray-700 rounded-md px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Relationship</label>
                  <select value={newReqRel} onChange={e => setNewReqRel(e.target.value)} className="w-full bg-[#111317] border border-gray-700 rounded-md px-3 py-2 text-white">
                    {RELATIONSHIP_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Context (Optional)</label>
                  <input type="text" placeholder="e.g. Cybersecurity Bootcamp 2025" value={newReqContext} onChange={e => setNewReqContext(e.target.value)} className="w-full bg-[#111317] border border-gray-700 rounded-md px-3 py-2 text-white" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm">Generate Link</button>
                <button type="button" onClick={() => setShowNewRequestForm(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium text-sm">Cancel</button>
              </div>
            </form>
          )}

          <div className="bg-[#111317] border border-gray-800 rounded-xl overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#1a1d24] text-gray-400 text-sm uppercase tracking-wider border-b border-gray-800">
                  <th className="p-4 font-medium">Recipient</th>
                  <th className="p-4 font-medium">Context</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-center">Link</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {collectionRequests.map((r) => (
                  <tr key={r.id} className="text-gray-300 hover:bg-[#161b22] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{r.recipient_name}</div>
                      {r.recipient_email && <div className="text-xs text-gray-500">{r.recipient_email}</div>}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{r.relationship_type}</div>
                      <div className="text-xs text-gray-500">{r.context}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full uppercase tracking-wider
                        ${r.status === 'active' ? 'bg-blue-500/10 text-blue-400' : ''}
                        ${r.status === 'submitted' ? 'bg-green-500/10 text-green-500' : ''}
                        ${r.status === 'revoked' ? 'bg-red-500/10 text-red-500' : ''}
                      `}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {r.status === 'active' ? (
                        <button onClick={() => copyLink(r.token)} className="text-gray-400 hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-md inline-flex items-center gap-1 text-xs">
                          <Copy size={14} /> Copy URL
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">Unavailable</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'active' && (
                        <button onClick={() => revokeRequest(r.id)} className="text-xs text-red-400 hover:text-red-300">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {collectionRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No collection requests generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
