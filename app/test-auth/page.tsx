'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function AuthTestPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});

  const runTests = async () => {
    setTesting(true);
    setResults({});

    const testResults: Record<string, { success: boolean; message: string }> =
      {};

    // Test 1: Connexion Supabase
    try {
      const { error } = await supabase.auth.getSession();
      if (error) throw error;

      testResults.connection = {
        success: true,
        message: 'Connexion Supabase établie',
      };
    } catch (error) {
      testResults.connection = {
        success: false,
        message: `Erreur de connexion: ${
          error instanceof Error ? error.message : 'Inconnue'
        }`,
      };
    }

    // Test 2: Variables d'environnement
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    testResults.environment = {
      success: hasUrl && hasKey,
      message:
        hasUrl && hasKey
          ? "Variables d'environnement configurées"
          : `Manquant: ${!hasUrl ? 'SUPABASE_URL ' : ''}${
              !hasKey ? 'SUPABASE_ANON_KEY' : ''
            }`,
    };

    // Test 3: Test de création de compte fictif
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const { error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
      });

      if (error && !error.message.includes('User already registered')) {
        throw error;
      }

      testResults.auth = {
        success: true,
        message: 'Authentification fonctionnelle',
      };
    } catch (error) {
      testResults.auth = {
        success: false,
        message: `Erreur auth: ${
          error instanceof Error ? error.message : 'Inconnue'
        }`,
      };
    }

    // Test 4: Test des tables (si RLS configuré)
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);

      testResults.database = {
        success: !error || error.code === 'PGRST116', // Table not found is OK
        message: !error
          ? 'Base de données accessible'
          : error.code === 'PGRST116'
          ? 'Tables pas encore créées (normal)'
          : `Erreur BDD: ${error.message}`,
      };
    } catch (error) {
      testResults.database = {
        success: false,
        message: `Erreur BDD: ${
          error instanceof Error ? error.message : 'Inconnue'
        }`,
      };
    }

    setResults(testResults);
    setTesting(false);
  };

  const TestResult = ({
    title,
    result,
  }: {
    title: string;
    result: { success: boolean; message: string };
  }) => (
    <div className="flex items-center space-x-3 p-3 border rounded-lg">
      {result.success ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600" />
      )}
      <div>
        <div className="font-medium">{title}</div>
        <div
          className={`text-sm ${
            result.success ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {result.message}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test de l&apos;Authentification Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Cette page permet de tester la configuration de
              l&apos;authentification Supabase. Utilisez-la pour diagnostiquer
              les problèmes de connexion.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuration actuelle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">Supabase URL</div>
                <div className="text-sm text-muted-foreground">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(
                        0,
                        30,
                      )}...`
                    : 'Non configurée'}
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">Clé anon</div>
                <div className="text-sm text-muted-foreground">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(
                        0,
                        20,
                      )}...`
                    : 'Non configurée'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Button onClick={runTests} disabled={testing} className="w-full">
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : (
                'Lancer les tests'
              )}
            </Button>
          </div>

          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Résultats des tests</h3>
              <div className="space-y-3">
                {results.connection && (
                  <TestResult
                    title="Connexion Supabase"
                    result={results.connection}
                  />
                )}
                {results.environment && (
                  <TestResult
                    title="Variables d'environnement"
                    result={results.environment}
                  />
                )}
                {results.auth && (
                  <TestResult title="Authentification" result={results.auth} />
                )}
                {results.database && (
                  <TestResult
                    title="Base de données"
                    result={results.database}
                  />
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Instructions de configuration
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copiez `.env.local.example` vers `.env.local`</li>
                  <li>2. Remplissez vos clés Supabase dans `.env.local`</li>
                  <li>3. Exécutez `setup-auth-supabase.sql` dans Supabase</li>
                  <li>4. Redémarrez le serveur de développement</li>
                  <li>5. Relancez les tests</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
