'use server';

import { createServiceClient } from '@/lib/supabase-server';
import { getServerWriter } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getClustersAction() {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('content_clusters')
    .select(`
      *,
      cluster_articles (*)
    `)
    .eq('writer_id', writer.id)
    .order('created_at', { ascending: false });

  if (error) {
    return { error: 'Failed to fetch clusters' };
  }

  return { data: data || [] };
}

export async function getClusterAction(id: string) {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('content_clusters')
    .select(`
      *,
      cluster_articles (*)
    `)
    .eq('id', id)
    .eq('writer_id', writer.id)
    .single();

  if (error) return { error: 'Failed to fetch cluster' };
  return { data };
}

export async function createClusterAction(name: string, description: string) {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('content_clusters')
    .insert({
      writer_id: writer.id,
      name,
      description
    });

  if (error) return { error: 'Failed to create cluster' };
  
  revalidatePath('/writer/clusters');
  return { success: true };
}

export async function addClusterArticleAction(clusterId: string, title: string, description: string, targetKeyword: string, status: string, publishedUrl: string) {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  
  // Verify ownership
  const { data: cluster } = await supabase.from('content_clusters').select('id').eq('id', clusterId).eq('writer_id', writer.id).single();
  if (!cluster) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('cluster_articles')
    .insert({
      cluster_id: clusterId,
      title,
      description,
      target_keyword: targetKeyword,
      status,
      published_url: publishedUrl
    });

  if (error) return { error: 'Failed to add article' };
  
  revalidatePath(`/writer/clusters/${clusterId}`);
  return { success: true };
}

export async function updateClusterArticleStatusAction(articleId: string, clusterId: string, status: string, publishedUrl?: string) {
  const writer = await getServerWriter();
  if (!writer) return { error: 'Unauthorized' };

  const supabase = createServiceClient();
  
  // Verify ownership via cluster
  const { data: cluster } = await supabase.from('content_clusters').select('id').eq('id', clusterId).eq('writer_id', writer.id).single();
  if (!cluster) return { error: 'Unauthorized' };

  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (publishedUrl !== undefined) updateData.published_url = publishedUrl;

  const { error } = await supabase
    .from('cluster_articles')
    .update(updateData)
    .eq('id', articleId)
    .eq('cluster_id', clusterId);

  if (error) return { error: 'Failed to update article' };
  
  revalidatePath(`/writer/clusters/${clusterId}`);
  return { success: true };
}
