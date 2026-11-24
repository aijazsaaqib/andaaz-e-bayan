import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Feather, Menu, X, LayoutDashboard, LogIn, PenLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-full transition-colors ${
    isActive ? 'text-primary-800 bg-primary-100' : 'text-neutral-700 hover:text-primary-800 hover:bg-primary-50'
  }`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/poems/urdu', label: 'Urdu' },
    { to: '/poems/roman', label: 'Roman Urdu' },
    { to: '/poems/english', label: 'English' },
    { to: '/poets', label: 'Poets' },
    { to: '/videos', label: 'Videos' },
    { to: '/search', label: 'Search' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-primary-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-800 text-accent-300">
            <Feather className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-wide text-primary-900">eandaaz bayan</span>
            <span className="urdu-text block text-sm text-accent-700 leading-none">اندازِ بیاں</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link to="/submit" className="btn-primary !px-4 !py-2">
                <PenLine className="h-4 w-4" />
                Submit
              </Link>
              {isAdmin && (
                <Link to="/admin" className="btn-secondary !px-4 !py-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-error-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2">
                Join
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-neutral-700 hover:bg-primary-100 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-neutral-200/70 bg-primary-50 px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? 'bg-primary-100 text-primary-800' : 'text-neutral-700 hover:bg-primary-100'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-neutral-200/70 pt-3">
            {user ? (
              <>
                <Link to="/submit" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  <PenLine className="h-4 w-4" /> Submit Poetry
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="btn-secondary w-full" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={async () => {
                    setOpen(false);
                    await signOut();
                    navigate('/');
                  }}
                  className="rounded-full px-3 py-2.5 text-left text-sm font-medium text-neutral-600 hover:bg-primary-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary w-full" onClick={() => setOpen(false)}>
                  Join eandaaz bayan
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
