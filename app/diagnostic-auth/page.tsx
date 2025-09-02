'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
  interface DiagnosticResult {
    test: string;
    status: 'SUCCESS' | 'FAILED';
    details: Record<string, unknown>;
  }

  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Variables d'environnement
      results.push({
        test: "Variables d'environnement",
        status:
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? 'SUCCESS'
            : 'FAILED',
        details: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          keyPrefix:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        },
      });

      // Test 2: Import Supabase
      let supabase;
      try {
        const { createClient } = await import('@supabase/supabase-js');
        supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );

        results.push({
          test: 'Import et création client Supabase',
          status: 'SUCCESS',
          details: { message: 'Client créé avec succès' },
        });
      } catch (error) {
        results.push({
          test: 'Import et création client Supabase',
          status: 'FAILED',
          details: {
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          },
        });
      }

      // Test 3: Connexion réseau
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          results.push({
            test: 'Connexion réseau Supabase',
            status: error ? 'FAILED' : 'SUCCESS',
            details: { error: error?.message, hasData: !!data },
          });
        } catch (error) {
          results.push({
            test: 'Connexion réseau Supabase',
            status: 'FAILED',
            details: {
              error: error instanceof Error ? error.message : 'Erreur réseau',
            },
          });
        }
      }

      // Test 4: Test simple avec différentes adresses email
      const testEmails = [
        'test@gmail.com',
        'user@example.com',
        'admin@test.local',
        'demo@demo.com',
      ];

      for (const email of testEmails) {
        if (supabase) {
          try {
            const { data, error } = await supabase.auth.signUp({
              email: email,
              password: 'testpassword123',
            });

            results.push({
              test: `Test inscription avec ${email}`,
              status: error ? 'FAILED' : 'SUCCESS',
              details: {
                error: error?.message,
                userId: data.user?.id,
                hasSession: !!data.session,
                needsConfirmation: !data.session && !error,
              },
            });
          } catch (error) {
            results.push({
              test: `Test inscription avec ${email}`,
              status: 'FAILED',
              details: {
                error:
                  error instanceof Error ? error.message : 'Erreur inconnue',
              },
            });
          }
        }
      }

      setDiagnostics(results);
    } catch (error) {
      results.push({
        test: 'Diagnostic général',
        status: 'FAILED',
        details: {
          error: error instanceof Error ? error.message : 'Erreur générale',
        },
      });
      setDiagnostics(results);
    }

    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Diagnostic Complet Supabase Auth</CardTitle>
          <Button onClick={runDiagnostics} disabled={loading} className="mt-2">
            {loading ? 'Diagnostic en cours...' : 'Relancer le diagnostic'}
          </Button>
        </CardHeader>
        <CardContent>
          {diagnostics.length === 0 ? (
            <p>Diagnostic en cours...</p>
          ) : (
            <div className="space-y-4">
              {diagnostics.map((diagnostic, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    diagnostic.status === 'SUCCESS'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        diagnostic.status === 'SUCCESS'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {diagnostic.status}
                    </span>
                    <h3 className="font-semibold">{diagnostic.test}</h3>
                  </div>
                  <pre className="text-sm overflow-auto whitespace-pre-wrap bg-white p-2 rounded border">
                    {JSON.stringify(diagnostic.details, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
