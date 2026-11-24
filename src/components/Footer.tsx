import { Link } from 'react-router-dom';
import { Feather, Github, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 bg-hero-ink text-primary-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-700 text-accent-300">
                <Feather className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg tracking-wide">eandaaz bayan</p>
                <p className="urdu-text text-sm leading-none text-accent-300">اندازِ بیاں</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-100/80">
              A global home for Urdu poetry — classic and contemporary, in Nastaliq and Roman script, shared by poets from around the world.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-accent-300">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/poems/urdu" className="text-primary-100/90 transition-colors hover:text-white">Urdu Poetry</Link></li>
              <li><Link to="/poems/roman" className="text-primary-100/90 transition-colors hover:text-white">Roman Urdu Poetry</Link></li>
              <li><Link to="/poems/english" className="text-primary-100/90 transition-colors hover:text-white">English Poetry</Link></li>
              <li><Link to="/poets" className="text-primary-100/90 transition-colors hover:text-white">Poets</Link></li>
              <li><Link to="/videos" className="text-primary-100/90 transition-colors hover:text-white">Video Recitations</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-widest text-accent-300">Community</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/submit" className="text-primary-100/90 transition-colors hover:text-white">Submit Your Poetry</Link></li>
              <li><Link to="/register" className="text-primary-100/90 transition-colors hover:text-white">Become a Member</Link></li>
              <li><Link to="/bookmarks" className="text-primary-100/90 transition-colors hover:text-white">My Bookmarks</Link></li>
              <li><Link to="/search" className="text-primary-100/90 transition-colors hover:text-white">Search Poetry</Link></li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"><Twitter className="h-4 w-4" /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"><Facebook className="h-4 w-4" /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"><Instagram className="h-4 w-4" /></a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"><Github className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-primary-100/60">
          <p className="urdu-text text-sm leading-loose text-accent-200/80">شاعری دل کی زبان ہے</p>
          <p className="mt-2">© {new Date().getFullYear()} eandaaz bayan | اندازِ بیاں — Urdu poetry from around the world.</p>
        </div>
      </div>
    </footer>
  );
}
