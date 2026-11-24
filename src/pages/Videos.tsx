import { useEffect, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Video } from '@/lib/supabase';

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith('/embed/')) return url;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Video | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      setVideos((data as Video[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl text-neutral-900">Video Recitations</h1>
        <p className="urdu-text mt-2 text-2xl text-primary-700">مشاعرے اور سماعتیں</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
          Poetry recitations, Mushairas, and literary performances from around the world.
        </p>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4" onClick={() => setActive(null)}>
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-neutral-950 shadow-card-hover" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video">
              <iframe
                src={toEmbedUrl(active.video_url)}
                title={active.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 text-white">
              <p className="font-display text-lg">{active.title}</p>
              {active.poet_name && <p className="text-sm text-primary-100/70">{active.poet_name}{active.event_name ? ` · ${active.event_name}` : ''}</p>}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-neutral-500">Loading…</p>
      ) : videos.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500">No videos published yet. Check back soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v)}
              className="card group overflow-hidden text-left hover:shadow-card-hover"
            >
              <div className="relative aspect-video bg-neutral-900">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-hero-ink">
                    <PlayCircle className="h-12 w-12 text-accent-300" />
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="h-14 w-14 text-white drop-shadow transition-transform group-hover:scale-110" />
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg text-neutral-900">{v.title}</h3>
                {v.title_ur && <p className="urdu-text text-base text-primary-700">{v.title_ur}</p>}
                {(v.poet_name || v.event_name) && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {[v.poet_name, v.event_name].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
