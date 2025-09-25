'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCommandes } from '@/hooks/useCommandes';
import { calculateProgression } from '@/lib/progressionUtils';
import { Edit2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ClientName from './ClientName';
import CommandeStatusBadge from './CommandeStatusBadge';
import CommandeStatusSelect from './CommandeStatusSelect';

export default function CommandesList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedCommandeId, setSelectedCommandeId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'normale', 'migration_ouverture'
  const { data: commandes, isLoading, error } = useCommandes();
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des commandes...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des commandes:</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtre par défaut : on exclut les commandes expédiées et livrées
  let filteredCommandes = commandes ?? [];

  // Filtre par type de commande
  if (typeFilter !== 'all') {
    filteredCommandes = filteredCommandes.filter(c =>
      (c.type_commande || 'normale') === typeFilter
    );
  }

  // Filtre par statut si sélectionné
  if (statusFilter) {
    filteredCommandes = filteredCommandes.filter(c => c.etat === statusFilter);
  } else {
    filteredCommandes = filteredCommandes.filter(c => c.etat !== 'expedie');
  }

  // Filtre par recherche sur le numéro de commande
  if (search.trim()) {
    filteredCommandes = filteredCommandes.filter(c =>
      c.numero_commande.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }

  // Compteurs pour les badges (on exclut les expédiées du comptage par défaut)
  const allCommandes = (commandes ?? []).filter(c => c.etat !== 'expedie');
  const normalesCount = allCommandes.filter(c => (c.type_commande || 'normale') === 'normale').length;
  const migrationsCount = allCommandes.filter(c => c.type_commande === 'migration_ouverture').length;

  const totalPages = Math.ceil(filteredCommandes.length / pageSize);
  const paginatedCommandes = filteredCommandes.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Card className="shadow-xl bg-gradient-to-br from-blue-50 via-white to-orange-50 rounded-2xl border-0">
      <CardHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-100 via-white to-orange-100 rounded-t-2xl shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl font-extrabold text-blue-900">
              Liste des commandes{' '}
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-base ml-2">
                {filteredCommandes.length}
              </span>
            </CardTitle>
          </div>

          {/* Boutons de filtres par type */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                typeFilter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tous ({allCommandes.length})
            </button>
            <button
              onClick={() => setTypeFilter('normale')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                typeFilter === 'normale'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              📦 Commandes ({normalesCount})
            </button>
            <button
              onClick={() => setTypeFilter('migration_ouverture')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                typeFilter === 'migration_ouverture'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              🔄 Migration/Ouverture ({migrationsCount})
            </button>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <Button
              variant="default"
              className="font-semibold"
              onClick={() => router.push('/commandes/create')}
            >
              + Ajouter une commande
            </Button>
            <input
              type="text"
              placeholder="Rechercher par n° commande..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-2 border-blue-200 rounded-lg px-3 py-2 text-sm focus:border-blue-400 focus:outline-none shadow"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border-2 border-orange-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 focus:outline-none shadow"
            >
              <option value="">Tous statuts</option>
              <option value="en_attente">En attente</option>
              <option value="en_attente_dacompte">
                En attente d&apos;acompte
              </option>
              <option value="en_cours">En cours</option>
              <option value="pret_expedition">Prêt expédition</option>
              <option value="expedie">Expédiée</option>
              <option value="annule">Annulée</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table className="rounded-xl overflow-hidden">
          <TableHeader className="bg-blue-100">
            <TableRow>
              <TableHead className="text-blue-900 font-bold">Date</TableHead>
              <TableHead className="text-blue-900 font-bold">
                N° Commande
              </TableHead>
              <TableHead className="text-blue-900 font-bold">Client</TableHead>
              <TableHead className="text-blue-900 font-bold">Statut</TableHead>
              <TableHead className="text-blue-900 font-bold">
                Progression
              </TableHead>
              <TableHead className="text-blue-900 font-bold">
                Dates importantes
              </TableHead>
              <TableHead className="text-blue-900 font-bold">
                Total TTC
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCommandes.map(commande => (
              <TableRow
                key={commande.id}
                className="hover:bg-orange-100 cursor-pointer transition-all duration-200 rounded-xl shadow-sm"
                style={{ textDecoration: 'none' }}
                onClick={() => router.push(`/commandes/${commande.id}`)}
              >
                <TableCell className="text-sm text-gray-700">
                  {formatDate(commande.date_commande)}
                </TableCell>
                <TableCell className="font-semibold text-blue-900">
                  <div className="flex items-center gap-2">
                    <span>{commande.numero_commande.toUpperCase()}</span>
                    {commande.type_commande === 'migration_ouverture' && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                        🔄 Migration
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <ClientName clientId={commande.client_id} />
                  <div className="text-xs text-gray-400">
                    {commande.remarque && (
                      <span className="italic">{commande.remarque}</span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <CommandeStatusBadge status={commande.etat} />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedCommandeId(commande.id);
                          }}
                          aria-label="Changer le statut"
                          className="hover:bg-orange-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Changer le statut de la commande
                          </DialogTitle>
                        </DialogHeader>
                        {selectedCommandeId === commande.id && (
                          <CommandeStatusSelect
                            commandeId={commande.id}
                            currentStatus={commande.etat}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    // Calculer la progression en temps réel basée sur les produits
                    const calculatedProgression = calculateProgression(commande.commande_produits);
                    return (
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-3 shadow-inner">
                          <div
                            className="h-3 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculatedProgression}%`,
                              background:
                                calculatedProgression === 100
                                  ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                  : calculatedProgression >= 80
                                  ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)'
                                  : calculatedProgression >= 50
                                  ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                                  : 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                            }}
                          >
                            {calculatedProgression === 100 && (
                              <span className="text-xs text-white font-bold flex items-center justify-end pr-1 h-full">✓</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-bold ${
                            calculatedProgression === 100
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}>
                            {calculatedProgression}%
                          </span>
                          {calculatedProgression === 100 && (
                            <span className="text-green-600 text-xs font-semibold">
                              PRÊTE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  {(() => {
                    // Pour les commandes de migration, afficher les dates importantes avec warnings
                    if (commande.type_commande === 'migration_ouverture') {
                      const today = new Date();
                      const dateMigration = commande.date_migration ? new Date(commande.date_migration) : null;
                      const dateExpedition = commande.date_expedition_previsionnelle ? new Date(commande.date_expedition_previsionnelle) : null;

                      // Vérifier si la commande est en retard (pas encore expédiée et date d'expédition dépassée)
                      const isLate = dateExpedition &&
                                    today > dateExpedition &&
                                    !['expedie', 'livre'].includes(commande.etat);

                      const isUrgent = dateExpedition &&
                                      !['expedie', 'livre'].includes(commande.etat) &&
                                      (dateExpedition.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 7; // 7 jours ou moins

                      return (
                        <div className="space-y-1">
                          {/* Date de migration */}
                          <div className="flex items-center text-xs">
                            <span className="text-orange-700 font-medium">🔄 Migration:</span>
                            <span className="ml-1 text-gray-700">
                              {dateMigration ? formatDate(commande.date_migration) : '-'}
                            </span>
                          </div>

                          {/* Date d'expédition avec warning */}
                          <div className="flex items-center text-xs">
                            <span className="text-orange-700 font-medium">📦 Expédition:</span>
                            <span className={`ml-1 ${
                              isLate ? 'text-red-700 font-bold' :
                              isUrgent ? 'text-orange-700 font-bold' :
                              'text-gray-700'
                            }`}>
                              {dateExpedition ? formatDate(commande.date_expedition_previsionnelle) : '-'}
                            </span>
                            {isLate && (
                              <span className="ml-1 text-red-600 font-bold" title="En retard !">
                                ⚠️
                              </span>
                            )}
                            {isUrgent && !isLate && (
                              <span className="ml-1 text-orange-600" title="Urgent - moins de 7 jours">
                                ⏰
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Pour les commandes normales, afficher la date limite d'expédition si elle existe
                    if (commande.date_limite_expedition) {
                      return (
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">📦 Limite:</span>
                          <span className="ml-1">{formatDate(commande.date_limite_expedition)}</span>
                        </div>
                      );
                    }

                    return <span className="text-gray-400 text-xs">-</span>;
                  })()}
                </TableCell>
                <TableCell className="font-semibold text-blue-900">
                  {formatCurrency(commande.total_ttc)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4 flex-wrap">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            « Première
          </button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            ‹ Précédent
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .map(p => (
              <button
                key={p}
                className={`px-2 py-1 border rounded ${
                  p === page ? 'bg-blue-100 font-bold' : ''
                }`}
                onClick={() => setPage(p)}
                disabled={p === page}
              >
                {p}
              </button>
            ))}
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Suivant ›
          </button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Dernière »
          </button>
        </div>
      )}
    </Card>
  );
}
