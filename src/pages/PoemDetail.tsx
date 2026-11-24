import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Bookmark, Share2, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poem, PoemComment } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { usePoemInteractions } from '@/hooks/usePoemInteractions';

export default function PoemDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [comments, setComments] = useState<PoemComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const viewCounted = useRef(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('poems')
        .select('*, poets!inner(name, name_ur, slug), categories(name, slug)')
        .eq('id', id ?? '')
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
        return;
      }
      setPoem(data as Poem);
    })();
  }, [id]);

  useEffect(() => {
    if (!poem || viewCounted.current) return;
    viewCounted.current = true;
    supabase.rpc('increment_poem_views', { p_poem_id: poem.id });
  }, [poem]);

  const loadComments = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase
      .from('poem_comments')
      .select('*, profiles(username, display_name)')
      .eq('poem_id', id)
      .order('created_at', { ascending: true });
    setComments((data as PoemComment[]) ?? []);
  }, [id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-display text-2xl text-neutral-900">This poem could not be found.</p>
        <p className="urdu-text mt-2 text-xl text-primary-700">یہ شاید ہٹا دی گئی ہے</p>
        <Link to="/" className="btn-primary mt-8">Back to Home</Link>
      </div>
    );
  }

  if (!poem) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-neutral-500">Loading…</div>;
  }

  const isUrdu = poem.language === 'urdu';
  const hasRoman = poem.language === 'urdu' || (poem.language === 'roman' && !!poem.body_ur);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-primary-700">
        <ArrowLeft className="h-4 w-4" /> All poetry
      </Link>

      <article className="card mt-6 overflow-hidden">
        <div className="border-b border-neutral-100 bg-secondary-50 px-6 py-6 text-center sm:px-10">
          <h1 className={`text-3xl text-neutral-900 ${isUrdu && poem.title_ur ? 'urdu-text' : 'font-display'}`}>
            {isUrdu && poem.title_ur ? poem.title_ur : poem.title}
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            by{' '}
            <Link to={`/poet/${poem.poets?.slug}`} className="font-medium text-primary-700 hover:underline">
              {poem.poets?.name}
            </Link>
            {poem.poets?.name_ur && <span className="urdu-text ml-2 text-base">{poem.poets.name_ur}</span>}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            {poem.categories?.name && (
              <span className="rounded-full bg-primary-100 px-3 py-1 font-medium text-primary-800">{poem.categories.name}</span>
            )}
            <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-600 capitalize">{poem.language}</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-600">{poem.views} views</span>
          </div>
        </div>

        <div className="px-6 py-10 text-center sm:px-10">
          <p className={`poem-verse text-neutral-900 ${isUrdu ? 'urdu-text text-2xl leading-loose text-right sm:text-right' : 'font-serif text-xl leading-relaxed'}`}>
            {poem.body}
          </p>
          {hasRoman && (
            <div className="mt-10 rounded-xl bg-secondary-50 p-6 ring-1 ring-secondary-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary-700">Roman Urdu</p>
              <p className="poem-verse mt-3 font-serif text-lg leading-loose text-neutral-800" dir="ltr">
                {romanBody(poem)}
              </p>
            </div>
          )}
        </div>

        <PoemActions poem={poem} />
      </article>

      {/* Comments */}
      <section className="card mt-8 p-6">
        <h2 className="font-display text-xl text-neutral-900">Comments ({comments.length})</h2>
        {user ? (
          <form
            className="mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!commentText.trim() || posting) return;
              setPosting(true);
              setCommentError(null);
              const { error } = await supabase
                .from('poem_comments')
                .insert({ poem_id: poem.id, body: commentText.trim() });
              setPosting(false);
              if (error) {
                setCommentError('Could not post the comment. Please try again.');
              } else {
                setCommentText('');
                loadComments();
              }
            }}
          >
            <textarea
              className="input-field min-h-[80px]"
              placeholder="Share your thoughts on this verse…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={2000}
            />
            {commentError && <p className="mt-2 text-sm text-error-600">{commentError}</p>}
            <button type="submit" className="btn-primary mt-3" disabled={posting || !commentText.trim()}>
              {posting ? 'Posting…' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            <Link to="/login" className="font-medium text-primary-700 hover:underline">Sign in</Link> to join the conversation.
          </p>
        )}

        <ul className="mt-6 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl bg-secondary-50 p-4">
              <p className="text-sm font-medium text-neutral-800">
                {c.profiles?.display_name ?? c.profiles?.username ?? 'Reader'}
                <span className="ml-2 text-xs font-normal text-neutral-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-700">{c.body}</p>
            </li>
          ))}
          {comments.length === 0 && <li className="text-sm text-neutral-500">No comments yet.</li>}
        </ul>
      </section>
    </div>
  );
}

function romanBody(poem: Poem) {
  // Urdu poems currently store their Roman transliteration as a linked entry;
  // when the poet provided one on the same row, prefer it.
  return poem.body_ur ?? poem.body;
}

function PoemActions({ poem }: { poem: Poem }) {
  const { user } = useAuth();
  const { liked, bookmarked, likeCount, commentCount, toggleLike, toggleBookmark, share } =
    usePoemInteractions(poem, user?.id ?? null);

  return (
    <div className="flex items-center justify-center gap-6 border-t border-neutral-100 px-6 py-5">
      <button
        onClick={() => user && toggleLike()}
        disabled={!user}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          liked ? 'bg-error-50 text-error-600' : 'text-neutral-600 hover:bg-error-50 hover:text-error-600'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} /> {likeCount} {liked ? 'Liked' : 'Like'}
      </button>
      <button
        onClick={() => user && toggleBookmark()}
        disabled={!user}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          bookmarked ? 'bg-accent-100 text-accent-800' : 'text-neutral-600 hover:bg-accent-50 hover:text-accent-800'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} /> {bookmarked ? 'Saved' : 'Save'}
      </button>
      <button
        onClick={() => share()}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-800"
      >
        <Share2 className="h-4 w-4" /> Share
      </button>
      <span className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-500">
        <MessageCircle className="h-4 w-4" /> {commentCount}
      </span>
    </div>
  );
}
