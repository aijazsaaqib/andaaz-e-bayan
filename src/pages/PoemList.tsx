import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Poem } from '@/lib/supabase';
import PoemCard from '@/components/PoemCard';

const VALID = ['urdu', 'roman', 'english'] as const;
type Lang = (typeof VALID)[number];

const headings: Record<Lang, { en: string; ur: string; desc: string }> = {
  urdu: { en: 'Urdu Poetry', ur: 'اردو شاعری', desc: 'Poetry in the original Nastaliq script, shown with Roman transliteration.' },
  roman: { en: 'Roman Urdu Poetry', ur: 'رومن اردو شاعری', desc: 'Urdu verse written in Roman letters.' },
  english: { en: 'English Poetry', ur: 'انگریزی شاعری', desc: 'Poetry written in English by our global community.' },
};

export default function PoemList() {
  const { language } = useParams<{ language: string }>();
  const lang = (VALID as readonly string[]).includes(language ?? '') ? (language as Lang) : 'urdu';
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('poems')
        .select('*, poets(name, slug), categories(name, slug)')
        .eq('status', 'approved')
        .eq('language', lang)
        .order('created_at', { ascending: false });
      setPoems((data as Poem[]) ?? []);
      setLoading(false);
    })();
  }, [lang]);

  const h = headings[lang];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl text-neutral-900">{h.en}</h1>
        <p className="urdu-text mt-2 text-2xl text-primary-700">{h.ur}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">{h.desc}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-neutral-500">Loading…</p>
        ) : poems.length === 0 ? (
          <p className="col-span-full text-center text-neutral-500">
            No poems in this section yet. <span className="urdu-text">جلد آئیے</span>
          </p>
        ) : (
          poems.map((p) => <PoemCard key={p.id} poem={p} />)
        )}
      </div>
    </div>
  );
}
