'use client';

import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function TestSupabasePage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('Testing Supabase connection...');

      // Test 1: Vérifier la session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      console.log('Session test:', { sessionData, sessionError });

      // Test 2: Essayer de créer un utilisateur avec une adresse simple
      const testEmail = 'user@example.com';
      const testPassword = 'password123';

      console.log('Attempting to sign up with:', testEmail);

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

      console.log('Sign up result:', { signUpData, signUpError });

      setResult({
        session: { data: sessionData, error: sessionError },
        signUp: { data: signUpData, error: signUpError },
        connectionTest: 'Success',
      });
    } catch (error) {
      console.error('Test error:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionTest: 'Failed',
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test de Connexion Supabase</h1>

      <div className="mb-4">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester la Connexion'}
        </button>
      </div>

      {result !== null && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Résultats du Test:</h2>
          <pre className="text-sm overflow-auto">
            {typeof result === 'string'
              ? result
              : JSON.stringify(result as object, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Configuration Actuelle:</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>
            <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p>
            <strong>Key:</strong>{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  );
}
