'use client';

import React, { useState } from 'react';
import { submitTestimonial } from './actions';
import { Star, CheckCircle, Loader2 } from 'lucide-react';

export default function TestimonialClientForm({
  token,
  defaultName,
  defaultEmail,
  defaultRelationship,
  relationshipTypes
}: {
  token: string;
  defaultName: string;
  defaultEmail: string;
  defaultRelationship: string;
  relationshipTypes: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append('token', token);
    formData.append('rating', rating.toString());
    
    const res = await submitTestimonial(formData);
    
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Thank you for sharing your experience.</h2>
        <p className="text-gray-400">
          Your testimonial has been submitted for review. If approved, it may be published on this website.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
          <input 
            type="text" 
            name="name" 
            required 
            defaultValue={defaultName}
            className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input 
            type="email" 
            name="email" 
            defaultValue={defaultEmail}
            className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Professional Role / Title</label>
          <input 
            type="text" 
            name="role" 
            placeholder="e.g. Software Engineer, Student"
            className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
          <input 
            type="text" 
            name="organization"
            placeholder="e.g. Acme Corp, University of Lagos"
            className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">How do you know Elijah? *</label>
        <select 
          name="relationship_type" 
          defaultValue={defaultRelationship || relationshipTypes[0]}
          className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
        >
          {relationshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star 
                size={32} 
                className={`transition-colors ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Your Experience *</label>
        <textarea 
          name="quote" 
          required 
          minLength={20}
          maxLength={2000}
          rows={6}
          placeholder="Share your experience working or learning with us..."
          className="w-full bg-[#0a0c10] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-y"
        ></textarea>
        <p className="text-xs text-gray-500 mt-2">Between 20 and 2000 characters.</p>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-800">
        <h4 className="text-white font-medium mb-4">Consent</h4>
        
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" name="consent_to_publish" required className="mt-1 w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900" />
          <span className="text-sm text-gray-400 group-hover:text-gray-300">
            I give permission for this testimonial to be published on Elijah Adeyeye's website. *
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" name="consent_to_use_name" defaultChecked className="mt-1 w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900" />
          <span className="text-sm text-gray-400 group-hover:text-gray-300">
            I am happy for my name and professional role to be displayed.
          </span>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" name="consent_to_use_organization" defaultChecked className="mt-1 w-4 h-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900" />
          <span className="text-sm text-gray-400 group-hover:text-gray-300">
            I am happy for my organization to be displayed.
          </span>
        </label>
      </div>

      <div className="pt-6">
        <button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Submitting...' : 'Submit Testimonial'}
        </button>
      </div>
    </form>
  );
}
