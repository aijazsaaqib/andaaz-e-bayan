import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Poet } from '@/lib/supabase';
import PoetCard from '@/components/PoetCard';

export default function Poets() {
  const [poets, setPoets] = useState<Poet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('poets')
        .select('*')
        .order('featured', { ascending: false })
        .order('name');
      setPoets((data as Poet[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl text-neutral-900">Poets</h1>
        <p className="urdu-text mt-2 text-2xl text-primary-700">شعرا</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
          Masters of the craft and today's voices — profiles, biographies, and their published poetry.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : poets.length === 0 ? (
          <p className="col-span-full text-center text-neutral-500">No poets listed yet.</p>
        ) : (
          poets.map((p) => <PoetCard key={p.id} poet={p} />)
        )}
      </div>
    </div>
  );
}
