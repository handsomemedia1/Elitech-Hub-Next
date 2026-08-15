import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    // Call an RPC function or just get the current count and increment
    // Since we don't have a specific RPC setup in the prompt, let's fetch then update
    const { data: paper } = await supabase
      .from('research')
      .select('citations_count')
      .eq('slug', slug)
      .single();

    if (paper) {
      const newCount = (paper.citations_count || 0) + 1;
      await supabase
        .from('research')
        .update({ citations_count: newCount })
        .eq('slug', slug);
      
      return NextResponse.json({ success: true, citations_count: newCount });
    }
    
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  } catch (error) {
    console.error('Error logging citation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
