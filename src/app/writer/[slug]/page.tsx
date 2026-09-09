import { getSupabaseServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = getSupabaseServerClient();
  const { data: writer } = await supabase.from('writers').select('*').eq('slug', slug).single();

  if (!writer) return { title: 'Writer Not Found | Elitech Hub' };

  return {
    title: `${writer.full_name} - Cybersecurity Writer | Elitech Hub`,
    description: writer.bio || `Read publications and insights by ${writer.full_name}.`,
    alternates: {
      canonical: `https://elitechub.com/writer/${slug}`
    }
  };
}

export default async function WriterProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = getSupabaseServerClient();
  const { data: writer } = await supabase.from('writers').select('*').eq('slug', slug).single();

  if (!writer) notFound();

  // JSON-LD Person Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: writer.full_name,
    jobTitle: 'Cybersecurity Writer',
    worksFor: {
      '@type': 'Organization',
      name: 'Elitech Hub'
    },
    url: `https://elitechub.com/writer/${slug}`,
    image: writer.profile_image_url || 'https://elitechub.com/images/default-avatar.png',
    description: writer.bio
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto py-24 px-4 sm:px-6">
        <div className="bg-[#111317] border border-gray-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 shrink-0">
            <img src={writer.profile_image_url || '/images/default-avatar.png'} alt={writer.full_name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{writer.full_name}</h1>
            <p className="text-gray-400 mb-4">{writer.bio || 'Cybersecurity Author at Elitech Hub'}</p>
            <div className="flex gap-4">
              {writer.badges && (writer.badges as any[]).length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-semibold">
                  🏆 {(writer.badges as any[]).length} Badges Earned
                </div>
              )}
              {writer.points > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {writer.points} Points
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Publications</h2>
          {/* List of articles will be fetched dynamically from blog_posts where writer_id = writer.id */}
          <p className="text-gray-400">Articles coming soon.</p>
        </div>
      </div>
    </>
  );
}
