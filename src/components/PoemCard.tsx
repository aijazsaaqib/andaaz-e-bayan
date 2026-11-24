import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, Share2, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePoemInteractions } from '@/hooks/usePoemInteractions';
import type { Poem } from '@/lib/supabase';

type Props = {
  poem: Poem;
  onChanged?: () => void;
};

const langBadge: Record<Poem['language'], string> = {
  urdu: 'bg-primary-100 text-primary-800',
  roman: 'bg-secondary-100 text-secondary-800',
  english: 'bg-accent-100 text-accent-800',
};

export default function PoemCard({ poem, onChanged }: Props) {
  const { user } = useAuth();
  const { liked, bookmarked, likeCount, commentCount, toggleLike, toggleBookmark, share } =
    usePoemInteractions(poem, user?.id ?? null, onChanged);

  const poetName = poem.poets?.name ?? 'Unknown Poet';
  const isUrduPoem = poem.language === 'urdu';

  return (
    <article className="card group flex h-full flex-col overflow-hidden hover:shadow-card-hover">
      <div className="flex items-center justify-between px-5 pt-4">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${langBadge[poem.language]}`}>
          {poem.language === 'urdu' ? 'اردو' : poem.language === 'roman' ? 'Roman Urdu' : 'English'}
        </span>
        {poem.featured && (
          <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-medium text-accent-800">Featured</span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <Link to={`/poem/${poem.id}`} className="block">
          <h3 className={`font-semibold text-neutral-900 transition-colors group-hover:text-primary-700 ${isUrduPoem ? 'urdu-text text-xl text-right' : 'font-display text-xl'}`}>
            {isUrduPoem && poem.title_ur ? poem.title_ur : poem.title}
          </h3>
        </Link>
        <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
          {poetName}
          {poem.categories?.name ? ` · ${poem.categories.name}` : ''}
        </p>

        <Link to={`/poem/${poem.id}`} className="mt-4 flex-1">
          <p
            className={`poem-verse text-neutral-800 line-clamp-6 ${
              isUrduPoem ? 'urdu-text text-right text-base' : 'font-serif text-lg leading-relaxed'
            }`}
          >
            {poem.body}
          </p>
        </Link>

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-4 text-neutral-500">
            <button
              onClick={() => (user ? toggleLike() : undefined)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-error-600' : 'hover:text-error-600'
              } ${!user ? 'cursor-not-allowed opacity-60' : ''}`}
              aria-label="Like poem"
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <Link to={`/poem/${poem.id}`} className="flex items-center gap-1.5 text-sm transition-colors hover:text-primary-700">
              <MessageCircle className="h-4 w-4" />
              {commentCount}
            </Link>
            <span className="flex items-center gap-1.5 text-sm">
              <Eye className="h-4 w-4" />
              {poem.views}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (user ? toggleBookmark() : undefined)}
              className={`rounded-full p-1.5 transition-colors ${
                bookmarked ? 'text-accent-700 bg-accent-100' : 'text-neutral-500 hover:text-accent-700'
              } ${!user ? 'cursor-not-allowed opacity-60' : ''}`}
              aria-label="Bookmark poem"
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => share()}
              className="rounded-full p-1.5 text-neutral-500 transition-colors hover:text-primary-700"
              aria-label="Share poem"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
