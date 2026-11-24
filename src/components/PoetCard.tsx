import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import type { Poet } from '@/lib/supabase';

type Props = {
  poet: Poet;
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function PoetCard({ poet }: Props) {
  return (
    <Link to={`/poet/${poet.slug}`} className="card group flex flex-col items-center p-6 text-center hover:shadow-card-hover">
      {poet.photo_url ? (
        <img
          src={poet.photo_url}
          alt={poet.name}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-accent-300"
        />
      ) : (
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-800 font-display text-xl text-accent-300 ring-2 ring-accent-300">
          {initials(poet.name)}
        </span>
      )}
      <h3 className="mt-4 font-display text-lg text-neutral-900 transition-colors group-hover:text-primary-700">
        {poet.name}
      </h3>
      {poet.name_ur && <p className="urdu-text text-base text-primary-700">{poet.name_ur}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-500">
        {poet.country && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {poet.country}
          </span>
        )}
        {poet.era && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {poet.era}
          </span>
        )}
      </div>
      {poet.bio && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-600">{poet.bio}</p>
      )}
      {poet.featured && (
        <span className="mt-4 rounded-full bg-accent-100 px-3 py-1 text-xs font-medium text-accent-800">
          Featured Poet
        </span>
      )}
    </Link>
  );
}
