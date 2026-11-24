import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  photo_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

export type Poet = {
  id: string;
  user_id: string | null;
  name: string;
  name_ur: string | null;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  era: string | null;
  country: string | null;
  featured: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  name_ur: string | null;
  slug: string;
  description: string | null;
};

export type Poem = {
  id: string;
  poet_id: string;
  submitted_by: string | null;
  title: string;
  title_ur: string | null;
  language: 'urdu' | 'roman' | 'english';
  body: string;
  body_ur: string | null;
  category_id: string | null;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  views: number;
  created_at: string;
  poets?: Poet | null;
  categories?: Category | null;
};

export type Video = {
  id: string;
  title: string;
  title_ur: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  poet_name: string | null;
  event_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string | null;
  created_at: string;
};

export type PoemComment = {
  id: string;
  poem_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: Pick<Profile, 'id' | 'username' | 'display_name'> | null;
};

export const LANGUAGE_LABELS: Record<Poem['language'], string> = {
  urdu: 'Urdu',
  roman: 'Roman Urdu',
  english: 'English',
};
