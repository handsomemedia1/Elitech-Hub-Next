'use client';
import { useEffect, useRef } from 'react';

export function ViewTracker({ postId, writerId }: { postId: string, writerId?: string }) {
  const tracked = useRef(false);
  useEffect(() => {
    if (!tracked.current && postId) {
      tracked.current = true;
      fetch('/api/articles/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, writerId })
      }).catch(console.error);
    }
  }, [postId, writerId]);
  return null;
}
