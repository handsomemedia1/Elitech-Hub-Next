import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CHAPTERS } from '@/data/beforeCybersecurityData';
import { getServerUser } from '@/lib/auth';
import { checkUserEntitlement } from '@/lib/before-cybersecurity/entitlements';
import ChapterReaderClient from './ChapterReaderClient';
import LockedChapterView from './LockedChapterView';

interface ChapterPageProps {
  params: Promise<{ chapter: string }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) {
    return { title: 'Chapter Not Found' };
  }
  return {
    title: `Chapter ${chapter.number}: ${chapter.title}`,
    description: chapter.subtitle || chapter.keyPrinciple,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { chapter: slug } = await params;
  const chapterIndex = CHAPTERS.findIndex((c) => c.slug === slug);
  const chapter = CHAPTERS[chapterIndex];

  if (!chapter) {
    notFound();
  }

  // Chapters 1 & 2 (indices 0 & 1) are free public orientation preview chapters
  const isFreePreview = chapterIndex <= 1;

  if (isFreePreview) {
    return <ChapterReaderClient chapter={chapter} chapterIndex={chapterIndex} hasAccess={true} isPreview={true} />;
  }

  // Premium chapters (Chapters 3-29): strictly check server authentication and entitlement
  const user = await getServerUser();
  const entitlement = await checkUserEntitlement(user?.id, user?.role);

  if (!entitlement.hasAccess) {
    return <LockedChapterView chapter={chapter} chapterIndex={chapterIndex} isAuthenticated={!!user} />;
  }

  return <ChapterReaderClient chapter={chapter} chapterIndex={chapterIndex} hasAccess={true} isPreview={false} />;
}
