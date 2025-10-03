'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommandes } from '@/hooks/useCommandes';
import { AlertTriangle, CheckCircle, Clock, Loader2, ShoppingCart, FileText } from 'lucide-react';
import Link from 'next/link';
import { calculateProgression } from '@/lib/progressionUtils';
import CommandeStatusBadge from '@/components/CommandeStatusBadge';

export default function CommandesAlertsCard() {
  const { data: commandes, isLoading } = useCommandes();

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              Alertes Commandes en Retard
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrer les commandes normales (pas de migrations)
  const today = new Date();
  const normalCommandes = (commandes || []).filter(
    c => c.type_commande !== 'migration_ouverture'
  );

  // Commandes en retard : plus de 2 semaines (14 jours) et pas encore expédiées
  const lateCommandes = normalCommandes.filter(c => {
    if (['expedie', 'livre', 'annule'].includes(c.etat)) return false;

    const createdDate = new Date(c.created_at || c.date_commande);
    const daysOld = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 14;
  });

  // Commandes anciennes : entre 7 et 14 jours
  const oldCommandes = normalCommandes.filter(c => {
    if (['expedie', 'livre', 'annule'].includes(c.etat)) return false;

    const createdDate = new Date(c.created_at || c.date_commande);
    const daysOld = (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 7 && daysOld <= 14;
  });

  const hasAlerts = lateCommandes.length > 0 || oldCommandes.length > 0;

  return (
    <Card className={`shadow-xl border-0 ${
      hasAlerts
        ? 'bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50'
        : 'bg-gradient-to-r from-green-50 to-emerald-50'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className={`p-2 rounded-lg ${
              hasAlerts ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {hasAlerts ? (
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
            </div>
            <span className={`font-bold ${
              hasAlerts
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'
            }`}>
              Alertes Commandes en Retard
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
              {oldCommandes.length > 0 && (
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {oldCommandes.length} ancienne{oldCommandes.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Commandes en retard (> 2 semaines) */}
          {lateCommandes.length > 0 ? (
            <Alert variant="destructive" className="border-2 border-red-300 shadow-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {lateCommandes.length} + de 2 semaines
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {lateCommandes.slice(0, 3).map(commande => {
                  const createdDate = new Date(commande.created_at || commande.date_commande);
                  const daysOld = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
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
                            {daysOld}j
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
                    href="/commandes"
                    className="block text-center text-xs text-red-700 hover:text-red-900 font-semibold hover:underline pt-1"
                  >
                    + {lateCommandes.length - 3} autre{lateCommandes.length - 3 > 1 ? 's' : ''}
                  </Link>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

          {/* Commandes anciennes (7-14 jours) */}
          {oldCommandes.length > 0 ? (
            <Alert className="border-2 border-orange-300 bg-orange-50 shadow-lg">
              <Clock className="h-5 w-5 text-orange-600" />
              <AlertTitle className="text-orange-900 text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {oldCommandes.length} entre 1-2 semaines
              </AlertTitle>
              <AlertDescription className="text-orange-800">
                <div className="mt-2 space-y-2">
                  {oldCommandes.slice(0, 3).map(commande => {
                    const createdDate = new Date(commande.created_at || commande.date_commande);
                    const daysOld = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
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
                              {daysOld}j
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
                  {oldCommandes.length > 3 && (
                    <Link
                      href="/commandes"
                      className="block text-center text-xs text-orange-700 hover:text-orange-900 font-semibold hover:underline pt-1"
                    >
                      + {oldCommandes.length - 3} autre{oldCommandes.length - 3 > 1 ? 's' : ''}
                    </Link>
                  )}
                </div>
              </AlertDescription>
            </Alert>
        ) : null}

          {/* Aucune alerte - prend toute la largeur */}
          {lateCommandes.length === 0 && oldCommandes.length === 0 && (
            <div className="col-span-full text-center py-8 bg-white/30 rounded-xl border-2 border-green-200">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <p className="text-lg font-bold text-green-800 mb-1 flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Tout va bien !
              </p>
              <p className="text-green-700 text-sm">Aucune commande en retard</p>
              <p className="text-green-600 text-xs mt-1">
                {normalCommandes.length} commande{normalCommandes.length > 1 ? 's' : ''} normale{normalCommandes.length > 1 ? 's' : ''} en cours
              </p>
            </div>
          )}
        </div>

        {/* Lien vers toutes les commandes - en dehors de la grille */}
        {normalCommandes.length > 0 && (hasAlerts || true) && (
          <Link
            href="/commandes"
            className="flex items-center justify-center gap-2 py-2.5 px-4 mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg text-sm"
          >
            <FileText className="h-4 w-4" />
            Voir toutes les commandes ({normalCommandes.length})
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
