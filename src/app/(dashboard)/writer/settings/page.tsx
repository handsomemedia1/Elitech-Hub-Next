'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Link as LinkIcon, Briefcase, MapPin, Upload } from 'lucide-react';
import styles from './settings.module.css';

export default function WriterSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('elitech_token');
    if (!token) {
      router.push('/writer/login');
      return;
    }

    fetch('/api/writer/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.writer) {
          setProfile(data.writer);
        } else {
          setMessage('Error loading profile');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('elitech_token');
    try {
      const res = await fetch('/api/writer/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully!');
        setProfile(data.writer);
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setMessage('Error saving profile');
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('elitech_token');
    try {
      const res = await fetch('/api/writer/upload-avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfile({ ...profile, avatar_url: data.url });
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert('Error uploading avatar');
    }
  };

  if (loading) return <div className={styles.loadingText}>Loading profile...</div>;

  const calculateCompletion = () => {
    const fields = ['display_name', 'professional_title', 'bio', 'full_bio', 'avatar_url', 'expertise'];
    const filled = fields.filter(f => profile?.[f] && profile?.[f].length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completion = calculateCompletion();

  return (
    <div className={styles.settingsWrapper}>
      <div className={styles.header}>
        <h1>Writer Settings</h1>
        <p>Manage your editorial identity and public author profile.</p>
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('success') ? styles.messageSuccess : styles.messageError}`}>
          {message}
        </div>
      )}

      {completion < 100 && (
        <div className={styles.completionCard}>
          <h3>Complete your writer profile ({completion}%)</h3>
          <p>Add your professional title, bio, expertise, photo and professional links so readers can identify you as the author of your work.</p>
          <div className={styles.progressBarBg}>
            <div className={styles.progressBarFill} style={{ width: `${completion}%` }}></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave}>
        
        {/* Profile Photo Section */}
        <div className={styles.section}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarCircle}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <User size={40} />
              )}
            </div>
            <div className={styles.avatarUpload}>
              <h3>Profile Photo</h3>
              <label className={styles.uploadLabel}>
                <Upload size={16} />
                Upload Photo
                <input type="file" accept="image/jpeg,image/png,image/webp" className={styles.hiddenInput} onChange={handleAvatarUpload} />
              </label>
              <p>JPG, PNG or WebP, max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" name="name" value={profile?.name || ''} readOnly className={`${styles.input} ${styles.inputReadonly}`} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Display Name</label>
              <input type="text" name="display_name" value={profile?.display_name || ''} onChange={handleChange} className={styles.input} />
            </div>
            
            <div className={styles.formGroup}>
              <label>Professional Title</label>
              <div className={styles.inputWrapper}>
                <Briefcase size={16} className={styles.inputIcon} />
                <input type="text" name="professional_title" value={profile?.professional_title || ''} onChange={handleChange} placeholder="e.g. Senior Security Researcher" className={`${styles.input} ${styles.inputWithIcon}`} />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Location</label>
              <div className={styles.inputWrapper}>
                <MapPin size={16} className={styles.inputIcon} />
                <input type="text" name="location" value={profile?.location || ''} onChange={handleChange} placeholder="e.g. Lagos, Nigeria" className={`${styles.input} ${styles.inputWithIcon}`} />
              </div>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Short Bio</label>
            <textarea name="bio" value={profile?.bio || ''} onChange={handleChange} rows={2} maxLength={160} placeholder="A short 1-2 sentence description..." className={styles.textarea}></textarea>
          </div>
          
          <div className={styles.formGroup}>
            <label>Full Bio</label>
            <textarea name="full_bio" value={profile?.full_bio || ''} onChange={handleChange} rows={5} placeholder="Your complete editorial bio..." className={styles.textarea}></textarea>
          </div>
          
          <div className={styles.formGroup}>
            <label>Expertise (Comma separated)</label>
            <input type="text" name="expertise" value={profile?.expertise?.join(', ') || ''} onChange={(e) => setProfile({...profile, expertise: e.target.value.split(',').map((s: string) => s.trim())})} placeholder="Penetration Testing, Cloud Security, AI" className={styles.input} />
          </div>
        </div>

        {/* Professional Links Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Professional Links</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>LinkedIn URL</label>
              <div className={styles.inputWrapper}>
                <LinkIcon size={16} className={styles.inputIcon} />
                <input type="url" name="linkedin_url" value={profile?.linkedin_url || ''} onChange={handleChange} className={`${styles.input} ${styles.inputWithIcon}`} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Portfolio URL</label>
              <div className={styles.inputWrapper}>
                <LinkIcon size={16} className={styles.inputIcon} />
                <input type="url" name="portfolio_url" value={profile?.portfolio_url || ''} onChange={handleChange} className={`${styles.input} ${styles.inputWithIcon}`} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Personal Website</label>
              <div className={styles.inputWrapper}>
                <LinkIcon size={16} className={styles.inputIcon} />
                <input type="url" name="website_url" value={profile?.website_url || ''} onChange={handleChange} className={`${styles.input} ${styles.inputWithIcon}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Account Details</h3>
          <div className={styles.accountDetails}>
            <p><span>Email:</span> {profile?.email}</p>
            <p><span>Status:</span> <span className={styles.statusText}>{profile?.status}</span></p>
            <p><span>Author Slug:</span> {profile?.slug || 'Will be generated when you save your display name'}</p>
            
            {profile?.slug && (
              <div className={styles.publicProfileBox}>
                <p>Your Public Profile:</p>
                <div className={styles.publicProfileLinkWrapper}>
                  <code className={styles.slugCode}>
                    elitechub.com/authors/{profile.slug}
                  </code>
                  <a
                    href={`/authors/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewProfileLink}
                  >
                    View Public Profile ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {profile?.slug ? (
            <a
              href={`/authors/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.outlineBtn}
            >
              View Public Profile ↗
            </a>
          ) : (
            <div></div> /* Spacer for flex-between */
          )}
          <button type="submit" disabled={saving} className={styles.primaryBtn}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
