import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Check, X, Star, Trash2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poem, Video } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Tab = 'poems' | 'videos';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('poems');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [poemsRes, videosRes] = await Promise.all([
      supabase.from('poems').select('*, poets(name), categories(name)').order('created_at', { ascending: false }).limit(100),
      supabase.from('videos').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    if (poemsRes.error || videosRes.error) {
      setError('Could not load the dashboard. Admin access is required.');
    } else {
      setError(null);
      setPoems((poemsRes.data as Poem[]) ?? []);
      setVideos((videosRes.data as Video[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
    else setLoading(false);
  }, [isAdmin, load]);

  if (authLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-neutral-500">Loading…</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-error-600" />
        <h1 className="mt-4 font-display text-2xl text-neutral-900">Admin access only</h1>
        <p className="mt-2 text-sm text-neutral-500">This area is restricted to site administrators.</p>
        <Link to="/" className="btn-primary mt-6">Back to Home</Link>
      </div>
    );
  }

  const setStatus = async (kind: 'poem' | 'video', id: string, status: string) => {
    const fn = kind === 'poem' ? 'admin_set_poem_status' : 'admin_set_video_status';
    const { error: err } = await supabase.rpc(fn, { p_status: status, [kind === 'poem' ? 'p_poem' : 'p_video']: id });
    if (err) setError('Action failed. Please try again.');
    else load();
  };

  const toggleFeatured = async (poem: Poem) => {
    const { error: err } = await supabase.rpc('admin_toggle_poem_featured', { p_poem: poem.id, p_featured: !poem.featured });
    if (err) setError('Action failed. Please try again.');
    else load();
  };

  const deletePoem = async (id: string) => {
    const { error: err } = await supabase.rpc('admin_delete_poem', { p_poem: id });
    if (err) setError('Action failed. Please try again.');
    else load();
  };

  const deleteVideo = async (id: string) => {
    const { error: err } = await supabase.rpc('admin_delete_video', { p_video: id });
    if (err) setError('Action failed. Please try again.');
    else load();
  };

  const statusBadge = (status: string) => {
    const cls =
      status === 'approved' ? 'bg-success-100 text-success-700' :
      status === 'rejected' ? 'bg-error-100 text-error-700' :
      'bg-warning-100 text-warning-700';
    return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${cls}`}>{status}</span>;
  };

  const pendingPoems = poems.filter((p) => p.status === 'pending').length;
  const pendingVideos = videos.filter((v) => v.status === 'pending').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl text-neutral-900">Admin Dashboard</h1>
        <p className="urdu-text mt-2 text-2xl text-primary-700">انتظامیہ</p>
      </div>

      {error && <p className="mx-auto mt-6 max-w-xl rounded-lg bg-error-50 px-4 py-3 text-center text-sm text-error-700">{error}</p>}

      <div className="mt-8 flex justify-center gap-3">
        <button
          onClick={() => setTab('poems')}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            tab === 'poems' ? 'bg-primary-800 text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-primary-50'
          }`}
        >
          Poems ({poems.length}) {pendingPoems > 0 && <span className="ml-1 rounded-full bg-warning-500 px-2 py-0.5 text-xs text-white">{pendingPoems} pending</span>}
        </button>
        <button
          onClick={() => setTab('videos')}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            tab === 'videos' ? 'bg-primary-800 text-white' : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-primary-50'
          }`}
        >
          Videos ({videos.length}) {pendingVideos > 0 && <span className="ml-1 rounded-full bg-warning-500 px-2 py-0.5 text-xs text-white">{pendingVideos} pending</span>}
        </button>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-neutral-500">Loading…</p>
      ) : tab === 'poems' ? (
        <div className="mt-8 space-y-4">
          {poems.length === 0 && <p className="text-center text-neutral-500">No poems yet.</p>}
          {poems.map((p) => (
            <div key={p.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/poem/${p.id}`} className={`truncate font-medium text-neutral-900 hover:text-primary-700 ${p.language === 'urdu' && p.title_ur ? 'urdu-text text-lg' : ''}`}>
                    {p.language === 'urdu' && p.title_ur ? p.title_ur : p.title}
                  </Link>
                  {statusBadge(p.status)}
                  {p.featured && <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-medium text-accent-800">Featured</span>}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {p.poets?.name} · {p.categories?.name ?? 'No genre'} · {p.language} · {p.views} views · {new Date(p.created_at).toLocaleDateString()}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{p.body}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {p.status !== 'approved' && (
                  <button onClick={() => setStatus('poem', p.id, 'approved')} className="btn-primary !px-3 !py-1.5 !text-xs"><Check className="h-3.5 w-3.5" /> Approve</button>
                )}
                {p.status !== 'rejected' && (
                  <button onClick={() => setStatus('poem', p.id, 'rejected')} className="btn-secondary !px-3 !py-1.5 !text-xs"><X className="h-3.5 w-3.5" /> Reject</button>
                )}
                {p.status === 'approved' && (
                  <button onClick={() => setStatus('poem', p.id, 'pending')} className="btn-secondary !px-3 !py-1.5 !text-xs"><Clock className="h-3.5 w-3.5" /> Unpublish</button>
                )}
                <button
                  onClick={() => toggleFeatured(p)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    p.featured ? 'bg-accent-100 text-accent-800' : 'bg-neutral-100 text-neutral-600 hover:bg-accent-50 hover:text-accent-800'
                  }`}
                >
                  <Star className={`inline h-3.5 w-3.5 ${p.featured ? 'fill-current' : ''}`} /> {p.featured ? 'Featured' : 'Feature'}
                </button>
                <button
                  onClick={() => { if (window.confirm('Delete this poem permanently?')) deletePoem(p.id); }}
                  className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-600"
                  aria-label="Delete poem"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {videos.length === 0 && <p className="text-center text-neutral-500">No videos yet.</p>}
          {videos.map((v) => (
            <div key={v.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-neutral-900">{v.title}</span>
                  {statusBadge(v.status)}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {[v.poet_name, v.event_name].filter(Boolean).join(' · ') || 'No attribution'} · {new Date(v.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {v.status !== 'approved' && (
                  <button onClick={() => setStatus('video', v.id, 'approved')} className="btn-primary !px-3 !py-1.5 !text-xs"><Check className="h-3.5 w-3.5" /> Approve</button>
                )}
                {v.status !== 'rejected' && (
                  <button onClick={() => setStatus('video', v.id, 'rejected')} className="btn-secondary !px-3 !py-1.5 !text-xs"><X className="h-3.5 w-3.5" /> Reject</button>
                )}
                <button
                  onClick={() => { if (window.confirm('Delete this video permanently?')) deleteVideo(v.id); }}
                  className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-error-50 hover:text-error-600"
                  aria-label="Delete video"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
