'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommandes } from '@/hooks/useCommandes';
import { AlertTriangle, CheckCircle, Clock, Loader2, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';
import { calculateProgression } from '@/lib/progressionUtils';
import CommandeStatusBadge from '@/components/CommandeStatusBadge';

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
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Commandes en retard */}
          {lateCommandes.length > 0 ? (
            <Alert variant="destructive" className="border-2 border-red-300 shadow-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {lateCommandes.length} en retard
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {lateCommandes.slice(0, 3).map(commande => {
                  const daysLate = Math.floor(
                    (today.getTime() - new Date(commande.date_expedition_previsionnelle!).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const progression = calculateProgression(commande.commande_produits);
                  return (
                    <Link
                      key={commande.id}
                      href={`/commandes/${commande.id}`}
                      className="block p-2 bg-white/50 rounded-md hover:bg-white/80 transition-colors border border-red-200"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-red-900">{commande.numero_commande}</span>
                          <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            -{daysLate}j
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CommandeStatusBadge status={commande.etat} />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-red-600"
                                  style={{ width: `${progression}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-red-900 min-w-[2.5rem] text-right">
                                {progression}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {lateCommandes.length > 3 && (
                  <Link
                    href="/commandes?type=migration_ouverture&status=en_cours"
                    className="block text-center text-xs text-red-700 hover:text-red-900 font-semibold hover:underline pt-1"
                  >
                    + {lateCommandes.length - 3} autre{lateCommandes.length - 3 > 1 ? 's' : ''}
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
              <AlertTitle className="text-orange-900 text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {urgentCommandes.length} urgente{urgentCommandes.length > 1 ? 's' : ''}
              </AlertTitle>
              <AlertDescription className="text-orange-800">
                <div className="mt-2 space-y-2">
                  {urgentCommandes.slice(0, 3).map(commande => {
                    const daysUntil = Math.ceil(
                      (new Date(commande.date_expedition_previsionnelle!).getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const progression = calculateProgression(commande.commande_produits);
                    return (
                      <Link
                        key={commande.id}
                        href={`/commandes/${commande.id}`}
                        className="block p-2 bg-white/50 rounded-md hover:bg-white/80 transition-colors border border-orange-200"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-orange-900">{commande.numero_commande}</span>
                            <span className="px-1.5 py-0.5 bg-orange-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {daysUntil}j
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CommandeStatusBadge status={commande.etat} />
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                                    style={{ width: `${progression}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-semibold text-orange-900 min-w-[2.5rem] text-right">
                                  {progression}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {urgentCommandes.length > 3 && (
                    <Link
                      href="/commandes?type=migration_ouverture&status=en_cours"
                      className="block text-center text-xs text-orange-700 hover:text-orange-900 font-semibold hover:underline pt-1"
                    >
                      + {urgentCommandes.length - 3} autre{urgentCommandes.length - 3 > 1 ? 's' : ''}
                    </Link>
                  )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

          {/* Aucune alerte - prend toute la largeur */}
          {lateCommandes.length === 0 && urgentCommandes.length === 0 && (
            <div className="col-span-full text-center py-8 bg-white/30 rounded-xl border-2 border-green-200">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <p className="text-lg font-bold text-green-800 mb-1 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Tout va bien !
              </p>
              <p className="text-green-700 text-sm">Aucune migration en retard</p>
              <p className="text-green-600 text-xs mt-1">
                {migrationCommandes.length} migration{migrationCommandes.length > 1 ? 's' : ''} en cours
              </p>
            </div>
          )}
        </div>

        {/* Lien vers toutes les migrations - en dehors de la grille */}
        {migrationCommandes.length > 0 && (hasAlerts || true) && (
          <Link
            href="/commandes?type=migration_ouverture"
            className="flex items-center justify-center gap-2 py-2.5 px-4 mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
          >
            <FileText className="h-4 w-4" />
            Voir toutes les migrations ({migrationCommandes.length})
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
