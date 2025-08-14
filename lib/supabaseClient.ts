import { createClient } from '@supabase/supabase-js';

// Vérification des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Variable d'environnement NEXT_PUBLIC_SUPABASE_URL manquante",
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Variable d'environnement NEXT_PUBLIC_SUPABASE_ANON_KEY manquante",
  );
}

// Configuration sécurisée du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Stockage persistant de la session
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Auto-refresh de la session
    autoRefreshToken: true,
    // Persister la session
    persistSession: true,
    // Détecter les changements de session
    detectSessionInUrl: true,
  },
  // Configuration pour la sécurité
  global: {
    headers: {
      'x-application-name': 'totocmd',
    },
  },
});
