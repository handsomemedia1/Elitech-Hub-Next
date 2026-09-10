'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, X, FileText, Check } from 'lucide-react';
import { saveResource, deleteResource } from './actions';
import styles from '../admin.module.css';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [topic, setTopic] = useState('');
  const [resourceType, setResourceType] = useState('Guide');
  const [status, setStatus] = useState('published');
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    if (data) setResources(data);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setAuthor('');
    setTopic('');
    setResourceType('Guide');
    setStatus('published');
    setFileUrl('');
    setFile(null);
  };

  const openNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (resource: any) => {
    setEditingId(resource.id);
    setTitle(resource.title || '');
    setDescription(resource.description || '');
    setAuthor(resource.author || '');
    setTopic(resource.topic || '');
    setResourceType(resource.resource_type || 'Guide');
    setStatus(resource.status || 'published');
    setFileUrl(resource.file_url || '');
    setFile(null);
    setIsModalOpen(true);
  };

  const handleUploadAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (editingId) formData.append('id', editingId);
      formData.append('title', title);
      
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('file_url', fileUrl);
      }
      formData.append('description', description);
      formData.append('author', author);
      formData.append('topic', topic);
      formData.append('resource_type', resourceType);
      formData.append('status', status);

      await saveResource(formData);
      
      setIsModalOpen(false);
      fetchResources();
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        fetchResources();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Resources Management</h1>
          <p>Manage public resources, guides, and reports.</p>
        </div>
        <button onClick={openNew} className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Resource
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading resources...</div>
        ) : resources.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No resources found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Topic</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(res => (
                <tr key={res.id}>
                  <td style={{ fontWeight: 500, color: '#0f172a' }}>{res.title}</td>
                  <td>{res.resource_type}</td>
                  <td>{res.topic}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: res.status === 'published' ? '#dcfce7' : '#f1f5f9',
                      color: res.status === 'published' ? '#16a34a' : '#64748b',
                    }}>
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(res)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(res.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{editingId ? 'Edit Resource' : 'Add Resource'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUploadAndSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Title *</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Author</label>
                  <input type="text" value={author} onChange={e => setAuthor(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Topic</label>
                  <input type="text" value={topic} onChange={e => setTopic(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} placeholder="e.g. Threat Intelligence" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Resource Type</label>
                  <select value={resourceType} onChange={e => setResourceType(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    <option value="Guide">Guide</option>
                    <option value="Report">Report</option>
                    <option value="Whitepaper">Whitepaper</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Template">Template</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>File URL or Upload PDF</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." style={{ flexGrow: 1, padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} style={{ fontSize: '0.875rem' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting || (!fileUrl && !file)} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: (isSubmitting || (!fileUrl && !file)) ? 0.5 : 1 }}>
                  {isSubmitting ? 'Saving...' : 'Save Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
