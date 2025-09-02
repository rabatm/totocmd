'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface TestResult {
  success: boolean;
  data?: unknown;
  error?: string | null;
  action?: string;
  timestamp: string;
}

export default function TestAuthPage() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testDirectSupabase = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Import direct de supabase côté client
      const { createClient } = await import('@supabase/supabase-js');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      console.log('Config:', {
        supabaseUrl,
        supabaseKey: supabaseKey.substring(0, 20) + '...',
      });

      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log('Attempting to sign up with:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      console.log('Result:', { data, error });

      setResult({
        success: !error,
        data: data,
        error: error?.message || null,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Test error:', err);
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }

    setLoading(false);
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult(null);

    try {
      const { createClient } = await import('@supabase/supabase-js');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log('Attempting to sign in with:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      console.log('Sign in result:', { data, error });

      setResult({
        success: !error,
        data: data,
        error: error?.message || null,
        action: 'sign_in',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Sign in error:', err);
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        action: 'sign_in',
        timestamp: new Date().toISOString(),
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test d&apos;Authentification Direct</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email de test:</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mot de passe:</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={testDirectSupabase} disabled={loading}>
              {loading ? 'Test en cours...' : 'Tester Sign Up'}
            </Button>

            <Button onClick={testSignIn} disabled={loading} variant="outline">
              {loading ? 'Test en cours...' : 'Tester Sign In'}
            </Button>
          </div>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Résultat du Test:</h3>
              <div
                className={`p-4 rounded-lg ${
                  result.success
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-red-100 border border-red-300'
                }`}
              >
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Configuration Supabase:</h3>
            <p className="text-sm">
              URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
            </p>
            <p className="text-sm">
              Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}
              ...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
