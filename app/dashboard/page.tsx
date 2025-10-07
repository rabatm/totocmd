'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import RecentOrdersCard from '@/components/RecentOrdersCard';
import StatCard from '@/components/StatCard';
import StatusDistributionCard from '@/components/StatusDistributionCard';
import TopClientsCard from '@/components/TopClientsCard';
import ShipmentsStatsCard from '@/components/dashboard/ShipmentsStatsCard';
import ShipmentsAlertsCard from '@/components/dashboard/ShipmentsAlertsCard';
import MigrationAlertsCard from '@/components/dashboard/MigrationAlertsCard';
import CommandesAlertsCard from '@/components/dashboard/CommandesAlertsCard';
import SyncExtrabatClientsButton from '@/components/SyncExtrabatClientsButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
  AlertTriangle,
  BarChart3,
  Euro,
  Loader2,
  Monitor,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
  RefreshCw,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h2>
            <p className="text-gray-600 mb-4">
              Impossible de charger les statistiques du tableau de bord.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-gray-600 mt-1">
                Vue d&apos;ensemble de votre activité commerciale
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SyncExtrabatClientsButton />
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Link href="/commandes/create">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle commande
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Chargement du tableau de bord...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ========== SECTION 1: ALERTES ========== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Alertes et notifications
              </h2>

              {/* Alertes commandes normales */}
              <CommandesAlertsCard />

              {/* Alertes migrations */}
              <MigrationAlertsCard />

              {/* Alertes expéditions */}
              <ShipmentsAlertsCard />
            </div>

            {/* ========== SECTION 2: MÉTRIQUES ========== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Statistiques
              </h2>

              {/* Métriques commandes & CA */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Commandes"
                  value={stats?.totalCommandes || 0}
                  subtitle="Toutes commandes confondues"
                  icon={ShoppingCart}
                  color="blue"
                />
                <StatCard
                  title="En Cours"
                  value={stats?.commandesEnCours || 0}
                  subtitle="Commandes en traitement"
                  icon={Package}
                  color="orange"
                />
                <StatCard
                  title="CA Mensuel"
                  value={`${((stats?.chiffreAffairesMois || 0) / 1000).toFixed(1)}k€`}
                  subtitle="Chiffre d'affaires du mois"
                  icon={Euro}
                  color="green"
                />
                <StatCard
                  title="CA Annuel"
                  value={`${((stats?.chiffreAffairesAnnee || 0) / 1000).toFixed(1)}k€`}
                  subtitle="Chiffre d'affaires de l'année"
                  icon={TrendingUp}
                  color="purple"
                />
              </div>

              {/* Métriques produits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Produits"
                  value={stats?.totalProduits || 0}
                  subtitle="Articles en commande"
                  icon={Package}
                  color="blue"
                />
                <StatCard
                  title="Scannés"
                  value={stats?.produitsScannés || 0}
                  subtitle="Articles scannés"
                  icon={BarChart3}
                  color="gray"
                />
                <StatCard
                  title="En Préparation"
                  value={stats?.produitsEnPreparation || 0}
                  subtitle="Articles en cours"
                  icon={Wrench}
                  color="orange"
                />
                <StatCard
                  title="Prêts"
                  value={stats?.produitsPrets || 0}
                  subtitle="Prêts pour expédition"
                  icon={TrendingUp}
                  color="green"
                />
              </div>

              {/* Stats expéditions */}
              <ShipmentsStatsCard />
            </div>

            {/* ========== SECTION 3: VUE D'ENSEMBLE ========== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Monitor className="h-5 w-5 text-purple-600" />
                Vue d&apos;ensemble
              </h2>

              {/* Commandes récentes, clients, et statuts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <RecentOrdersCard orders={stats?.commandesRecentes || []} />
                <TopClientsCard clients={stats?.topClients || []} />
                <StatusDistributionCard
                  title="Statuts des Commandes"
                  data={stats?.commandesParStatut || []}
                  type="commandes"
                />
              </div>

              {/* Distribution des produits */}
              <StatusDistributionCard
                title="Statuts des Produits"
                data={stats?.produitsParStatut || []}
                type="produits"
              />
            </div>

            {/* ========== SECTION 4: ACTIONS RAPIDES ========== */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-green-600" />
                Actions rapides
              </h2>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <Link href="/commandes" className="block">
                      <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center gap-2 py-4">
                        <ShoppingCart className="h-6 w-6" />
                        <span className="text-xs">Commandes</span>
                      </Button>
                    </Link>
                    <Link href="/commandes/create" className="block">
                      <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center gap-2 py-4">
                        <Plus className="h-6 w-6" />
                        <span className="text-xs">Nouvelle</span>
                      </Button>
                    </Link>
                    <Link href="/clients" className="block">
                      <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center gap-2 py-4">
                        <Users className="h-6 w-6" />
                        <span className="text-xs">Clients</span>
                      </Button>
                    </Link>
                    <Link href="/pc-suivi" className="block">
                      <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center gap-2 py-4">
                        <Monitor className="h-6 w-6" />
                        <span className="text-xs">Suivi PC</span>
                      </Button>
                    </Link>
                    <Link href="/produits" className="block">
                      <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center gap-2 py-4">
                        <Package className="h-6 w-6" />
                        <span className="text-xs">Produits</span>
                      </Button>
                    </Link>
                    <Link href="/shipments" className="block">
                      <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center gap-2 py-4">
                        <TrendingUp className="h-6 w-6" />
                        <span className="text-xs">Expéditions</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200">
              Dernière mise à jour&nbsp;: {new Date().toLocaleString('fr-FR')}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
