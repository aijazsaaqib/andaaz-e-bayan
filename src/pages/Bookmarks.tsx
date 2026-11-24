import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poem } from '@/lib/supabase';
import PoemCard from '@/components/PoemCard';
import { useAuth } from '@/context/AuthContext';

export default function Bookmarks() {
  const { user } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('poem_bookmarks')
        .select('poems(*, poets(name, slug), categories(name, slug))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setPoems(((data as unknown as { poems: Poem }[]) ?? []).map((r) => r.poems).filter(Boolean));
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Bookmark className="mx-auto h-10 w-10 text-accent-700" />
        <h1 className="mt-4 font-display text-2xl text-neutral-900">Sign in to see your bookmarks</h1>
        <Link to="/login" className="btn-primary mt-6">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl text-neutral-900">My Bookmarks</h1>
        <p className="urdu-text mt-2 text-2xl text-primary-700">محفوظ شدہ شاعری</p>
      </div>
      {loading ? (
        <p className="mt-10 text-center text-neutral-500">Loading…</p>
      ) : poems.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">
          Nothing saved yet. Tap the bookmark icon on any poem to keep it here.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {poems.map((p) => (
            <PoemCard key={p.id} poem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
