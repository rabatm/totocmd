'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommandes } from '@/hooks/useCommandes';
import { AlertTriangle, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function MigrationAlertsCard() {
  const { data: commandes, isLoading } = useCommandes();

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
              Alertes Migrations en Retard
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
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

  const hasAlerts = lateCommandes.length > 0 || urgentCommandes.length > 0;

  return (
    <Card className={`shadow-xl border-0 ${
      hasAlerts
        ? 'bg-gradient-to-r from-orange-50 via-red-50 to-orange-50'
        : 'bg-gradient-to-r from-green-50 to-emerald-50'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className={`p-2 rounded-lg ${
              hasAlerts ? 'bg-orange-100' : 'bg-green-100'
            }`}>
              {hasAlerts ? (
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
            <span className={`font-bold ${
              hasAlerts
                ? 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
            }`}>
              Alertes Migrations en Retard
            </span>
          </CardTitle>
          {hasAlerts && (
            <div className="flex items-center gap-2 text-sm">
              {lateCommandes.length > 0 && (
                <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {lateCommandes.length} en retard
                </span>
              )}
              {urgentCommandes.length > 0 && (
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {urgentCommandes.length} urgent{urgentCommandes.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Commandes en retard */}
        {lateCommandes.length > 0 ? (
          <Alert variant="destructive" className="border-2 border-red-300 shadow-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">
              🚨 {lateCommandes.length} Migration{lateCommandes.length > 1 ? 's' : ''} en retard
            </AlertTitle>
            <AlertDescription>
              <div className="mt-3 space-y-2">
                {lateCommandes.slice(0, 5).map(commande => {
                  const daysLate = Math.floor(
                    (today.getTime() - new Date(commande.date_expedition_previsionnelle!).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Link
                      key={commande.id}
                      href={`/commandes/${commande.id}`}
                      className="block p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors border border-red-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900">{commande.numero_commande}</span>
                        <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                          -{daysLate} jour{daysLate > 1 ? 's' : ''}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {lateCommandes.length > 5 && (
                  <Link
                    href="/commandes?type=migration_ouverture&status=en_cours"
                    className="block text-center text-sm text-red-700 hover:text-red-900 font-semibold hover:underline pt-2"
                  >
                    + Voir {lateCommandes.length - 5} autre{lateCommandes.length - 5 > 1 ? 's' : ''} migration{lateCommandes.length - 5 > 1 ? 's' : ''} →
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Commandes urgentes */}
        {urgentCommandes.length > 0 ? (
          <Alert className="border-2 border-orange-300 bg-orange-50 shadow-lg">
            <Clock className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 text-lg font-bold">
              ⏰ {urgentCommandes.length} Migration{urgentCommandes.length > 1 ? 's' : ''} urgente
              {urgentCommandes.length > 1 ? 's' : ''}
            </AlertTitle>
            <AlertDescription className="text-orange-800">
              <div className="mt-3 space-y-2">
                {urgentCommandes.slice(0, 3).map(commande => {
                  const daysUntil = Math.ceil(
                    (new Date(commande.date_expedition_previsionnelle!).getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Link
                      key={commande.id}
                      href={`/commandes/${commande.id}`}
                      className="block p-3 bg-white/50 rounded-lg hover:bg-white/80 transition-colors border border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-900">{commande.numero_commande}</span>
                        <span className="px-2 py-1 bg-orange-600 text-white rounded-full text-xs font-bold">
                          {daysUntil} jour{daysUntil > 1 ? 's' : ''}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                {urgentCommandes.length > 3 && (
                  <Link
                    href="/commandes?type=migration_ouverture&status=en_cours"
                    className="block text-center text-sm text-orange-700 hover:text-orange-900 font-semibold hover:underline pt-2"
                  >
                    + Voir {urgentCommandes.length - 3} autre{urgentCommandes.length - 3 > 1 ? 's' : ''} migration{urgentCommandes.length - 3 > 1 ? 's' : ''} →
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Aucune alerte */}
        {lateCommandes.length === 0 && urgentCommandes.length === 0 && (
          <div className="text-center py-12 bg-white/30 rounded-xl border-2 border-green-200">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <p className="text-xl font-bold text-green-800 mb-2">✅ Tout va bien !</p>
            <p className="text-green-700">Aucune migration en retard</p>
            <p className="text-green-600 text-sm mt-2">
              {migrationCommandes.length} migration{migrationCommandes.length > 1 ? 's' : ''} en cours
            </p>
          </div>
        )}

        {/* Lien vers toutes les migrations */}
        {migrationCommandes.length > 0 && (hasAlerts || true) && (
          <Link
            href="/commandes?type=migration_ouverture"
            className="block text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            📋 Voir toutes les migrations ({migrationCommandes.length})
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
