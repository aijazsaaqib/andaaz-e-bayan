import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category, Poet } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function Submit() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [myPoet, setMyPoet] = useState<Poet | null>(null);
  const [title, setTitle] = useState('');
  const [titleUr, setTitleUr] = useState('');
  const [language, setLanguage] = useState<'urdu' | 'roman' | 'english'>('urdu');
  const [body, setBody] = useState('');
  const [bodyUr, setBodyUr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      setCategories((cats as Category[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('poets').select('*').eq('user_id', user.id).maybeSingle();
      setMyPoet((data as Poet | null) ?? null);
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <PenLine className="mx-auto h-10 w-10 text-primary-700" />
        <h1 className="mt-4 font-display text-2xl text-neutral-900">Sign in to submit your poetry</h1>
        <p className="mt-2 text-sm text-neutral-500">Your verses deserve a global audience.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate('/login')} className="btn-secondary">Sign in</button>
          <button onClick={() => navigate('/register')} className="btn-primary">Create account</button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myPoet) {
      setError('Your poet profile is still being prepared. Please try again in a moment.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from('poems').insert({
      poet_id: myPoet.id,
      title: title.trim(),
      title_ur: titleUr.trim() || null,
      language,
      body: body.trim(),
      body_ur: bodyUr.trim() || null,
      category_id: categoryId || null,
    });
    setBusy(false);
    if (err) {
      setError('Could not submit the poem. Please review the fields and try again.');
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <PenLine className="mx-auto h-10 w-10 text-success-600" />
        <h1 className="mt-4 font-display text-2xl text-neutral-900">Your poem was submitted</h1>
        <p className="urdu-text mt-2 text-lg text-primary-700">آپ کی شاعری موصول ہو گئی</p>
        <p className="mt-3 text-sm text-neutral-500">
          Our editors will review it shortly. Once approved, it will appear publicly on the site.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary mt-8">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl text-neutral-900">Submit Your Poetry</h1>
        <p className="urdu-text mt-2 text-2xl text-primary-700">اپنی شاعری پیش کریں</p>
        <p className="mt-3 text-sm text-neutral-500">
          Publishing as <span className="font-medium text-neutral-800">{profile?.display_name ?? user.email}</span>. Submissions are reviewed by editors before going live.
        </p>
      </div>

      <form onSubmit={submit} className="card mt-10 space-y-5 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="title">Title (Roman/English)</label>
            <input id="title" required maxLength={200} className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hazaaron Khwahishen" />
          </div>
          <div>
            <label className="label-text" htmlFor="titleUr">Title (Urdu script, optional)</label>
            <input id="titleUr" maxLength={200} className="input-field urdu-text !text-right" value={titleUr} onChange={(e) => setTitleUr(e.target.value)} placeholder="ہزاروں خواہشیں" />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="language">Language / Script</label>
            <select id="language" className="input-field" value={language} onChange={(e) => setLanguage(e.target.value as typeof language)}>
              <option value="urdu">Urdu (Nastaliq)</option>
              <option value="roman">Roman Urdu</option>
              <option value="english">English</option>
            </select>
          </div>
          <div>
            <label className="label-text" htmlFor="category">Genre</label>
            <select id="category" className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Choose a genre…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label-text" htmlFor="body">Poem {language === 'urdu' ? '(Urdu script)' : ''}</label>
          <textarea
            id="body"
            required
            maxLength={10000}
            className={`input-field min-h-[200px] leading-relaxed ${language === 'urdu' ? 'urdu-text !text-right' : 'font-serif'}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={language === 'urdu' ? 'اپنی شاعری یہاں لکھیں…' : 'Write your verses here…'}
          />
        </div>

        {language === 'urdu' && (
          <div>
            <label className="label-text" htmlFor="bodyUr">Roman transliteration (optional)</label>
            <textarea
              id="bodyUr"
              maxLength={10000}
              className="input-field min-h-[120px] font-serif"
              value={bodyUr}
              onChange={(e) => setBodyUr(e.target.value)}
              placeholder="Hazaaron khwahishen aisi ke har khwahish pe dam nikle…"
            />
            <p className="mt-1 text-xs text-neutral-400">Helps readers worldwide enjoy your Urdu verses.</p>
          </div>
        )}

        {error && <p className="rounded-lg bg-error-50 px-4 py-3 text-sm text-error-700">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit for Review'}
        </button>
      </form>
    </div>
  );
}
