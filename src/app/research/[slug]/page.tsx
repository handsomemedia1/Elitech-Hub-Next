import React from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import PageLayout from '@/components/PageLayout';
import layoutStyles from '@/components/PageLayout.module.css';
import styles from '../research.module.css';
import { FileText, Download, Clock, ArrowLeft, Quote } from 'lucide-react';
import Link from 'next/link';

type Props = {
  params: { slug: string }
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: paper } = await supabase
    .from('research')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!paper) {
    return {
      title: 'Paper Not Found',
    };
  }

  const authorsString = paper.authors && Array.isArray(paper.authors) && paper.authors.length > 0 
    ? paper.authors.map((a: any) => a.name).join(', ')
    : paper.author || 'Elitech Research Labs';

  return {
    title: paper.seo_title || `${paper.title} | Elitech Hub Research`,
    description: paper.seo_description || (paper.abstract ? paper.abstract.substring(0, 150) + '...' : ''),
    authors: [{ name: authorsString }],
    openGraph: {
      title: paper.title,
      description: paper.abstract,
      type: 'article',
      publishedTime: paper.created_at,
    },
    // Adding Google Scholar Highwire Press tags via custom other tags
    other: {
      'citation_title': paper.title,
      'citation_author': authorsString,
      'citation_publication_date': new Date(paper.created_at).getFullYear().toString(),
      'citation_pdf_url': paper.file_url ? `https://elitechub.com/${paper.file_url}` : '',
      ...(paper.doi && { 'citation_doi': paper.doi })
    }
  };
}

export default async function ResearchPaperPage({ params }: Props) {
  const { slug } = await params;

  const { data: paper } = await supabase
    .from('research')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!paper) {
    notFound();
  }

  // Increment views server side or we could do it client side. Let's keep it simple.
  if (paper.id) {
    try {
      await supabase.rpc('increment_research_view', { row_id: paper.id });
    } catch (e) {
      // ignore
    }
  }

  const authorsString = paper.authors && Array.isArray(paper.authors) && paper.authors.length > 0 
    ? paper.authors.map((a: any) => a.name).join(', ')
    : paper.author || 'Elitech Research Labs';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    name: paper.title,
    headline: paper.title,
    description: paper.abstract ? paper.abstract.substring(0, 300) : '',
    datePublished: new Date(paper.created_at).toISOString().split('T')[0],
    author: paper.authors && Array.isArray(paper.authors) && paper.authors.length > 0
      ? paper.authors.map((a: any) => ({
          '@type': 'Person',
          name: a.name,
          ...(a.institution && { affiliation: { '@type': 'Organization', name: a.institution } })
        }))
      : { '@type': 'Organization', name: paper.author || 'Elitech Research Labs' },
    publisher: {
      '@type': 'Organization',
      name: 'Elitech Hub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://elitechub.com/images/logo.png'
      }
    },
    ...(paper.doi && { sameAs: `https://doi.org/${paper.doi}` }),
    ...(paper.keywords && paper.keywords.length > 0 && { keywords: paper.keywords.join(', ') }),
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={layoutStyles.pageHero} style={{ background: '#0f172a', padding: '6rem 2rem 4rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
          <Link href="/research" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', textDecoration: 'none', marginBottom: '2rem' }}>
            <ArrowLeft size={16} /> Back to Repository
          </Link>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span style={{ background: '#1e293b', color: '#3b82f6', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
              {paper.category}
            </span>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', lineHeight: 1.2 }}>
            {paper.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            <div>
              <strong>Authors:</strong> {authorsString}
            </div>
            {paper.doi && (
              <div>
                <strong>DOI:</strong> <a href={`https://doi.org/${paper.doi}`} style={{ color: '#3b82f6' }}>{paper.doi}</a>
              </div>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {new Date(paper.created_at).toLocaleDateString()}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={14} /> {paper.citations_count || 0} Citations</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '4rem 2rem', color: '#334155' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          
          <main>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0f172a' }}>Abstract</h2>
            <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#475569', marginBottom: '3rem' }}>
              {paper.abstract ? paper.abstract.split('\n').map((para: string, i: number) => <p key={i} style={{ marginBottom: '1rem' }}>{para}</p>) : 'No abstract available.'}
            </div>

            {paper.keywords && paper.keywords.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Keywords</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {paper.keywords.map((kw: string, i: number) => (
                    <span key={i} style={{ background: '#e2e8f0', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'sticky', top: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#0f172a' }}>Access Options</h3>
              
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                This research paper is open-access. You must be logged into your Elitech account to download the full PDF manuscript.
              </p>

              <Link href="/admin/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#3b82f6', color: 'white', padding: '1rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, width: '100%', marginBottom: '1rem' }}>
                <Download size={18} /> Download Full PDF
              </Link>

              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #cbd5e1', color: '#334155', padding: '1rem', borderRadius: '8px', fontWeight: 600, width: '100%', cursor: 'pointer' }}>
                <Quote size={18} /> Cite this paper
              </button>
            </div>
          </aside>

        </div>
      </div>
    </PageLayout>
  );
}
