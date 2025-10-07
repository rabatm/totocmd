'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SyncExtrabatClientsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    total: number;
    inserted: number;
    updated: number;
    errors: number;
    message: string;
  } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setShowResults(false);

    try {
      const response = await fetch('/api/sync/clients', {
        method: 'POST',
      });

      const data = await response.json();
      setResults(data);
      setShowResults(true);

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la synchronisation'
      );
      setResults({
        success: false,
        total: 0,
        inserted: 0,
        updated: 0,
        errors: 1,
        message: 'Erreur réseau',
      });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSync}
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        {isLoading ? 'Synchronisation...' : 'Sync ExtraBat'}
      </Button>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {results?.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Résultats de la synchronisation
            </DialogTitle>
            <DialogDescription>{results?.message}</DialogDescription>
          </DialogHeader>

          {results && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total clients</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {results.total}
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Ajoutés</div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.inserted}
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600">Mis à jour</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {results.updated}
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">Erreurs</div>
                  <div className="text-2xl font-bold text-red-600">
                    {results.errors}
                  </div>
                </div>
              </div>

              {results.success && (
                <div className="p-3 bg-green-100 border border-green-200 rounded-lg text-sm text-green-800">
                  ✅ La synchronisation s&apos;est terminée avec succès
                </div>
              )}

              {!results.success && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-800">
                  ❌ La synchronisation a rencontré des erreurs
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setShowResults(false)} variant="outline">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
