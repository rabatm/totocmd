'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>(
    'testing',
  );
  const [message, setMessage] = useState('Test de la connexion...');

  useEffect(() => {
    async function testConnection() {
      try {
        // Test simple : récupérer les informations de l'utilisateur
        const { error } = await supabase.auth.getUser();

        if (error && error.message === 'Invalid API key') {
          setStatus('error');
          setMessage('Clé API Supabase invalide. Vérifiez votre .env.local');
          return;
        }

        // Test de connexion à la base de données
        const { error: dbError } = await supabase
          .from('commandes')
          .select('count')
          .limit(1);

        if (dbError) {
          setStatus('error');
          setMessage(`Erreur de base de données: ${dbError.message}`);
          return;
        }

        setStatus('success');
        setMessage('Connexion Supabase réussie !');
      } catch (err) {
        setStatus('error');
        setMessage(
          `Erreur de connexion: ${
            err instanceof Error ? err.message : 'Erreur inconnue'
          }`,
        );
      }
    }

    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'testing':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'testing':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Test en cours</Badge>
        );
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Connecté</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            {getStatusIcon()}
            <span className="ml-2">État de la connexion Supabase</span>
          </span>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{message}</p>

        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h4 className="font-medium text-red-800 mb-2">
              Comment corriger :
            </h4>
            <ol className="text-sm text-red-700 space-y-1">
              <li>1. Allez sur https://supabase.com/dashboard</li>
              <li>2. Sélectionnez votre projet</li>
              <li>3. Allez dans Settings {'>'} API</li>
              <li>4. Copiez la clé &quot;anon/public&quot;</li>
              <li>
                5. Mettez à jour NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local
              </li>
              <li>6. Redémarrez le serveur de développement</li>
            </ol>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>URL Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p>
            Clé API (premiers caractères):{' '}
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
