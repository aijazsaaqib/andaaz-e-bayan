import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Poem } from '@/lib/supabase';

export function usePoemInteractions(poem: Poem, userId: string | null, onChanged?: () => void) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  const loadCounts = useCallback(async () => {
    const [likesRes, commentsRes] = await Promise.all([
      supabase.from('poem_likes').select('id', { count: 'exact', head: true }).eq('poem_id', poem.id),
      supabase.from('poem_comments').select('id', { count: 'exact', head: true }).eq('poem_id', poem.id),
    ]);
    setLikeCount(likesRes.count ?? 0);
    setCommentCount(commentsRes.count ?? 0);
  }, [poem.id]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    if (!userId) {
      setLiked(false);
      setBookmarked(false);
      return;
    }
    (async () => {
      const [likeRes, bookmarkRes] = await Promise.all([
        supabase.from('poem_likes').select('id').eq('poem_id', poem.id).eq('user_id', userId).maybeSingle(),
        supabase.from('poem_bookmarks').select('id').eq('poem_id', poem.id).eq('user_id', userId).maybeSingle(),
      ]);
      setLiked(!!likeRes.data);
      setBookmarked(!!bookmarkRes.data);
    })();
  }, [userId, poem.id]);

  const toggleLike = async () => {
    if (!userId) return;
    if (liked) {
      await supabase.from('poem_likes').delete().eq('poem_id', poem.id).eq('user_id', userId);
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from('poem_likes').insert({ poem_id: poem.id });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
    onChanged?.();
  };

  const toggleBookmark = async () => {
    if (!userId) return;
    if (bookmarked) {
      await supabase.from('poem_bookmarks').delete().eq('poem_id', poem.id).eq('user_id', userId);
      setBookmarked(false);
    } else {
      await supabase.from('poem_bookmarks').insert({ poem_id: poem.id });
      setBookmarked(true);
    }
    onChanged?.();
  };

  const share = async () => {
    const url = `${window.location.origin}/poem/${poem.id}`;
    const text = `${poem.title} — ${poem.poets?.name ?? ''} | eandaaz bayan`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'eandaaz bayan', text, url });
        return;
      } catch {
        // user dismissed; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Link copied to clipboard');
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  return { liked, bookmarked, likeCount, commentCount, toggleLike, toggleBookmark, share };
}
