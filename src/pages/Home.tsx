import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Feather, BookOpen, Globe2, Users, PlayCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poem, Poet, Category } from '@/lib/supabase';
import PoemCard from '@/components/PoemCard';
import PoetCard from '@/components/PoetCard';

export default function Home() {
  const [featured, setFeatured] = useState<Poem[]>([]);
  const [latest, setLatest] = useState<Poem[]>([]);
  const [popular, setPopular] = useState<Poem[]>([]);
  const [poets, setPoets] = useState<Poet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const poemSelect = '*, poets!inner(name, slug), categories(name, slug)';
      const [featRes, latestRes, popularRes, poetsRes, catRes] = await Promise.all([
        supabase.from('poems').select(poemSelect).eq('status', 'approved').eq('featured', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('poems').select(poemSelect).eq('status', 'approved').order('created_at', { ascending: false }).limit(6),
        supabase.from('poems').select(poemSelect).eq('status', 'approved').order('views', { ascending: false }).limit(3),
        supabase.from('poets').select('*').order('featured', { ascending: false }).order('name').limit(6),
        supabase.from('categories').select('*').order('name'),
      ]);
      setFeatured((featRes.data as Poem[]) ?? []);
      setLatest((latestRes.data as Poem[]) ?? []);
      setPopular((popularRes.data as Poem[]) ?? []);
      setPoets((poetsRes.data as Poet[]) ?? []);
      setCategories((catRes.data as Category[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-hero-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <p className="urdu-text animate-fade-up text-3xl text-accent-300 sm:text-4xl" style={{ animationDelay: '0ms' }}>
            اندازِ بیاں
          </p>
          <h1 className="animate-fade-up font-display mt-4 text-4xl leading-tight tracking-wide sm:text-5xl lg:text-6xl" style={{ animationDelay: '100ms' }}>
            eandaaz bayan
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-100/90" style={{ animationDelay: '200ms' }}>
            A world stage for Urdu poetry — ghazals, nazms and beyond, in Nastaliq, Roman and English. Discover the masters, and share your own voice.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-4" style={{ animationDelay: '300ms' }}>
            <Link to="/poems/urdu" className="btn-primary !bg-accent-500 !text-primary-950 hover:!bg-accent-400">
              Explore Poetry <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/submit" className="btn-secondary !border-white/30 !bg-transparent !text-white hover:!bg-white/10">
              <Feather className="h-4 w-4" /> Share Your Verse
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-8 text-sm">
            <div>
              <p className="font-display text-2xl text-accent-300">6</p>
              <p className="mt-1 text-primary-100/70">Literary Genres</p>
            </div>
            <div>
              <p className="font-display text-2xl text-accent-300">3</p>
              <p className="mt-1 text-primary-100/70">Scripts &amp; Languages</p>
            </div>
            <div>
              <p className="font-display text-2xl text-accent-300">1</p>
              <p className="mt-1 text-primary-100/70">Global Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section switcher cards */}
      <section className="mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { to: '/poems/urdu', label: 'Urdu Poetry', urdu: 'اردو شاعری', desc: 'The original Nastaliq script' },
            { to: '/poems/roman', label: 'Roman Urdu Poetry', urdu: 'رومن اردو', desc: 'Read in Roman letters' },
            { to: '/poems/english', label: 'English Poetry', urdu: 'انگریزی', desc: 'World poetry in English' },
          ].map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="card group flex items-center justify-between p-6 hover:shadow-card-hover"
            >
              <div>
                <p className="font-display text-lg text-neutral-900 transition-colors group-hover:text-primary-700">{s.label}</p>
                <p className="mt-1 text-sm text-neutral-500">{s.desc}</p>
              </div>
              <span className="urdu-text text-2xl text-accent-700">{s.urdu}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl text-neutral-900">Literary Genres</h2>
            <p className="urdu-text mt-1 text-lg text-primary-700">ادبی اصناف</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/search?category=${c.slug}`}
              className="card flex flex-col items-center gap-1 p-5 text-center hover:shadow-card-hover"
            >
              <span className="urdu-text text-2xl text-primary-800">{c.name_ur}</span>
              <span className="text-sm font-medium text-neutral-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured poetry */}
      {featured.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl text-neutral-900">Featured Poetry</h2>
                <p className="urdu-text mt-1 text-lg text-primary-700">منتخب اشاعت</p>
              </div>
              <Link to="/search" className="hidden items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800 sm:flex">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {featured.map((p) => (
                <PoemCard key={p.id} poem={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest poetry */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl text-neutral-900">Latest Poetry</h2>
            <p className="urdu-text mt-1 text-lg text-primary-700">تازہ اشاعت</p>
          </div>
          <Link to="/search" className="hidden items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800 sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <p className="mt-8 text-neutral-500">Loading poetry…</p>
        ) : latest.length === 0 ? (
          <p className="mt-8 text-neutral-500">No poems yet — be the first to share one.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <PoemCard key={p.id} poem={p} />
            ))}
          </div>
        )}
      </section>

      {/* Most popular + Featured poets */}
      <section className="bg-secondary-50 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl text-neutral-900">Most Popular</h2>
            <p className="urdu-text mt-1 text-lg text-primary-700">مقبول ترین</p>
            <div className="mt-8 space-y-4">
              {popular.map((p, i) => (
                <Link key={p.id} to={`/poem/${p.id}`} className="card flex items-center gap-4 p-4 hover:shadow-card-hover">
                  <span className="font-display text-2xl text-accent-600">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium text-neutral-900 ${p.language === 'urdu' ? 'urdu-text text-lg' : ''}`}>
                      {p.language === 'urdu' && p.title_ur ? p.title_ur : p.title}
                    </p>
                    <p className="text-xs text-neutral-500">{p.poets?.name} · {p.views} views</p>
                  </div>
                  <BookOpen className="h-4 w-4 shrink-0 text-neutral-400" />
                </Link>
              ))}
              {popular.length === 0 && <p className="text-sm text-neutral-500">Popular poems will appear here.</p>}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl text-neutral-900">Featured Poets</h2>
                <p className="urdu-text mt-1 text-lg text-primary-700">مشہور شعرا</p>
              </div>
              <Link to="/poets" className="flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800">
                All poets <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {poets.slice(0, 4).map((poet) => (
                <PoetCard key={poet.id} poet={poet} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Videos teaser + join CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/videos" className="card group flex items-center gap-6 bg-hero-ink p-8 text-white hover:shadow-card-hover">
            <PlayCircle className="h-12 w-12 shrink-0 text-accent-300 transition-transform group-hover:scale-110" />
            <div>
              <h3 className="font-display text-2xl">Video Recitations</h3>
              <p className="urdu-text mt-1 text-lg text-accent-300">مشاعرے اور سماعتیں</p>
              <p className="mt-2 text-sm text-primary-100/80">Mushairas, recitations and literary performances from around the world.</p>
            </div>
          </Link>
          <Link to="/register" className="card group flex items-center gap-6 bg-accent-50 p-8 ring-1 ring-accent-200 hover:shadow-card-hover">
            <Users className="h-12 w-12 shrink-0 text-accent-700 transition-transform group-hover:scale-110" />
            <div>
              <h3 className="font-display text-2xl text-neutral-900">Join the Gathering</h3>
              <p className="urdu-text mt-1 text-lg text-primary-700">شاعری سے شریک ہوں</p>
              <p className="mt-2 text-sm text-neutral-600">Create your free account, publish your poetry, and connect with readers worldwide.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Globe strip */}
      <section className="border-y border-neutral-200/70 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 text-sm text-neutral-500 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary-700" /> Public &amp; worldwide</span>
          <span className="flex items-center gap-2"><Feather className="h-4 w-4 text-primary-700" /> Poet submissions welcomed</span>
          <span className="hidden items-center gap-2 sm:flex"><BookOpen className="h-4 w-4 text-primary-700" /> Curated by editors</span>
        </div>
      </section>
    </div>
  );
}
