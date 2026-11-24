import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-800 text-accent-300">
        <Feather className="h-6 w-6" />
      </span>
      <h1 className="mt-4 font-display text-3xl text-neutral-900">Welcome back</h1>
      <p className="urdu-text mt-1 text-lg text-primary-700">خوش آمدید</p>

      <form
        className="mt-8 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const { error: err } = await signIn(email, password);
          setBusy(false);
          if (err) setError(err);
          else navigate('/');
        }}
      >
        <div>
          <label className="label-text" htmlFor="email">Email</label>
          <input id="email" type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mt-4">
          <label className="label-text" htmlFor="password">Password</label>
          <input id="password" type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="mt-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        New to eandaaz bayan?{' '}
        <Link to="/register" className="font-medium text-primary-700 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
