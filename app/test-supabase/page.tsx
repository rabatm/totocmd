'use client';

import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function TestSupabase() {
  const [status, setStatus] = useState('Connexion en cours...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('Test de connexion Supabase...');

        // Test simple de connexion
        const { data, error } = await supabase
          .from('commandes')
          .select('count(*)')
          .limit(1);

        if (error) {
          console.error('Erreur Supabase:', error);
          setError(`Erreur Supabase: ${error.message}`);
          setStatus('Échec de connexion');
        } else {
          console.log('Connexion Supabase réussie:', data);
          setStatus('Connexion réussie !');
        }
      } catch (err) {
        console.error('Erreur générale:', err);
        setError(
          `Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
        );
        setStatus('Erreur de connexion');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Connexion Supabase</h2>
      <div className="space-y-2">
        <p>
          <strong>Statut:</strong> {status}
        </p>
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="text-sm text-gray-600">
          <p>
            <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p>
            <strong>Clé:</strong>{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  );
}
