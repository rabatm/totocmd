'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommandes } from '@/hooks/useCommandes';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MigrationAlertsCard() {
  const { data: commandes, isLoading } = useCommandes();

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertes Migrations en Retard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrer les commandes migration en retard
  const today = new Date();
  const migrationCommandes = (commandes || []).filter(
    c => c.type_commande === 'migration_ouverture'
  );

  const lateCommandes = migrationCommandes.filter(c => {
    if (!c.date_expedition_previsionnelle) return false;
    if (['expedie', 'livre'].includes(c.etat)) return false;

    const dateExpedition = new Date(c.date_expedition_previsionnelle);
    return today > dateExpedition;
  });

  const urgentCommandes = migrationCommandes.filter(c => {
    if (!c.date_expedition_previsionnelle) return false;
    if (['expedie', 'livre'].includes(c.etat)) return false;

    const dateExpedition = new Date(c.date_expedition_previsionnelle);
    const daysUntil = (dateExpedition.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 7;
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Alertes Migrations en Retard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Commandes en retard */}
        {lateCommandes.length > 0 ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {lateCommandes.length} Migration{lateCommandes.length > 1 ? 's' : ''} en retard
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {lateCommandes.slice(0, 5).map(commande => {
                  const daysLate = Math.floor(
                    (today.getTime() - new Date(commande.date_expedition_previsionnelle!).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Link
                      key={commande.id}
                      href={`/commandes/${commande.id}`}
                      className="block hover:underline"
                    >
                      <div className="text-sm">
                        <span className="font-semibold">{commande.numero_commande}</span>
                        {' • '}
                        <span className="text-red-700">
                          {daysLate} jour{daysLate > 1 ? 's' : ''} de retard
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {lateCommandes.length > 5 && (
                  <Link href="/commandes?type=migration_ouverture" className="text-sm hover:underline">
                    + {lateCommandes.length - 5} autre{lateCommandes.length - 5 > 1 ? 's' : ''}
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Commandes urgentes */}
        {urgentCommandes.length > 0 ? (
          <Alert className="border-orange-200 bg-orange-50">
            <RefreshCw className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">
              {urgentCommandes.length} Migration{urgentCommandes.length > 1 ? 's' : ''} urgente
              {urgentCommandes.length > 1 ? 's' : ''}
            </AlertTitle>
            <AlertDescription className="text-orange-700">
              <div className="mt-2 space-y-2">
                {urgentCommandes.slice(0, 3).map(commande => {
                  const daysUntil = Math.ceil(
                    (new Date(commande.date_expedition_previsionnelle!).getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Link
                      key={commande.id}
                      href={`/commandes/${commande.id}`}
                      className="block hover:underline"
                    >
                      <div className="text-sm">
                        <span className="font-semibold">{commande.numero_commande}</span>
                        {' • '}
                        <span>
                          {daysUntil} jour{daysUntil > 1 ? 's' : ''} restant{daysUntil > 1 ? 's' : ''}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {urgentCommandes.length > 3 && (
                  <Link href="/commandes?type=migration_ouverture" className="text-sm hover:underline">
                    + {urgentCommandes.length - 3} autre{urgentCommandes.length - 3 > 1 ? 's' : ''}
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Aucune alerte */}
        {lateCommandes.length === 0 && urgentCommandes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune migration en retard</p>
            <p className="text-xs mt-1">
              {migrationCommandes.length} migration{migrationCommandes.length > 1 ? 's' : ''} en cours
            </p>
          </div>
        )}

        {/* Lien vers toutes les migrations */}
        {migrationCommandes.length > 0 && (
          <Link
            href="/commandes?type=migration_ouverture"
            className="block text-center text-sm text-blue-600 hover:underline pt-2 border-t"
          >
            Voir toutes les migrations ({migrationCommandes.length})
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
