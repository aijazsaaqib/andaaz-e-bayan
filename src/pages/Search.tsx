import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poem, Category } from '@/lib/supabase';
import PoemCard from '@/components/PoemCard';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const categorySlug = params.get('category') ?? '';
  const [input, setInput] = useState(query);
  const [categories, setCategories] = useState<Category[]>([]);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      setCategories((data as Category[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!query && !categorySlug) {
      setPoems([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    (async () => {
      let req = supabase
        .from('poems')
        .select('*, poets!inner(name, slug), categories!inner(name, slug)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);
      if (categorySlug) req = req.eq('categories.slug', categorySlug);
      if (query) {
        req = req.or(
          [
            `title.ilike.%${query}%`,
            `body.ilike.%${query}%`,
            `poets.name.ilike.%${query}%`,
          ].join(',')
        );
      }
      const { data } = await req;
      setPoems((data as Poem[]) ?? []);
      setLoading(false);
      setSearched(true);
    })();
  }, [query, categorySlug]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (input.trim()) next.set('q', input.trim());
    if (categorySlug) next.set('category', categorySlug);
    setParams(next);
  };

  const setCategory = (slug: string) => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (slug) next.set('category', slug);
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl text-neutral-900">Search Poetry</h1>
        <p className="urdu-text mt-2 text-2xl text-primary-700">تلاش</p>
      </div>

      <form onSubmit={submit} className="mx-auto mt-8 flex max-w-2xl gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="input-field !pl-11"
            placeholder="Search by poet, title, or keywords…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setCategory('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !categorySlug ? 'bg-primary-800 text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-primary-50'
          }`}
        >
          All genres
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              categorySlug === c.slug ? 'bg-primary-800 text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-primary-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading ? (
          <p className="text-center text-neutral-500">Searching…</p>
        ) : poems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {poems.map((p) => (
              <PoemCard key={p.id} poem={p} />
            ))}
          </div>
        ) : searched ? (
          <p className="text-center text-neutral-500">No poems matched your search. Try different keywords or a genre.</p>
        ) : (
          <p className="text-center text-neutral-500">Enter a keyword or pick a genre to explore the collection.</p>
        )}
      </div>
    </div>
  );
}
