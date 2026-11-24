import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-800 text-accent-300">
        <Feather className="h-6 w-6" />
      </span>
      <h1 className="mt-4 font-display text-3xl text-neutral-900">Join eandaaz bayan</h1>
      <p className="urdu-text mt-1 text-lg text-primary-700">شاعری کا سفر شروع کریں</p>
      <p className="mt-3 text-center text-sm text-neutral-500">
        Create a free account to submit poetry, like, comment, and bookmark your favourite verses.
      </p>

      <form
        className="mt-8 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const { error: err } = await signUp(email, password, displayName.trim());
          setBusy(false);
          if (err) setError(err);
          else navigate('/');
        }}
      >
        <div>
          <label className="label-text" htmlFor="name">Pen name</label>
          <input id="name" type="text" required minLength={2} maxLength={60} className="input-field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="label-text" htmlFor="email">Email</label>
          <input id="email" type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="label-text" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="mt-1 text-xs text-neutral-400">At least 8 characters.</p>
        </div>
        {error && <p className="mt-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Already a member?{' '}
        <Link to="/login" className="font-medium text-primary-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
