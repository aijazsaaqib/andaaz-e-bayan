import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poet, Poem } from '@/lib/supabase';
import PoemCard from '@/components/PoemCard';

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function PoetDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [poet, setPoet] = useState<Poet | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data: poetData } = await supabase
        .from('poets')
        .select('*')
        .eq('slug', slug ?? '')
        .maybeSingle();
      if (!poetData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPoet(poetData as Poet);
      const { data: poemData } = await supabase
        .from('poems')
        .select('*, poets(name, slug), categories(name, slug)')
        .eq('status', 'approved')
        .eq('poet_id', poetData.id)
        .order('created_at', { ascending: false });
      setPoems((poemData as Poem[]) ?? []);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center text-neutral-500">Loading…</div>;
  }

  if (notFound || !poet) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-display text-2xl text-neutral-900">Poet not found.</p>
        <p className="urdu-text mt-2 text-xl text-primary-700">شاعر نہیں ملا</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-hero-ink text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {poet.photo_url ? (
              <img src={poet.photo_url} alt={poet.name} className="h-28 w-28 rounded-full object-cover ring-4 ring-accent-400/60" />
            ) : (
              <span className="flex h-28 w-28 items-center justify-center rounded-full bg-primary-700 font-display text-3xl text-accent-300 ring-4 ring-accent-400/60">
                {initials(poet.name)}
              </span>
            )}
            <div>
              <h1 className="font-display text-3xl sm:text-4xl">{poet.name}</h1>
              {poet.name_ur && <p className="urdu-text mt-2 text-2xl text-accent-300">{poet.name_ur}</p>}
              <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-primary-100/80 sm:justify-start">
                {poet.country && (
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {poet.country}</span>
                )}
                {poet.era && (
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {poet.era}</span>
                )}
                {poet.featured && (
                  <span className="rounded-full bg-accent-500 px-3 py-0.5 text-xs font-semibold text-primary-950">Featured Poet</span>
                )}
              </div>
            </div>
          </div>
          {poet.bio && (
            <p className="mx-auto mt-8 max-w-3xl leading-relaxed text-primary-100/90 sm:mx-0">{poet.bio}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl text-neutral-900">
          Poetry by {poet.name} <span className="text-sm font-normal text-neutral-500">({poems.length})</span>
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {poems.length === 0 ? (
            <p className="col-span-full text-neutral-500">No published poems for this poet yet.</p>
          ) : (
            poems.map((p) => <PoemCard key={p.id} poem={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
