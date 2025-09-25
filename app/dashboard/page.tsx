'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import RecentOrdersCard from '@/components/RecentOrdersCard';
import StatCard from '@/components/StatCard';
import StatusDistributionCard from '@/components/StatusDistributionCard';
import TopClientsCard from '@/components/TopClientsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
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
          <div className="space-y-8">
            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* Graphiques et listes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Commandes récentes */}
              <div className="lg:col-span-1">
                <RecentOrdersCard orders={stats?.commandesRecentes || []} />
              </div>

              {/* Top clients */}
              <div className="lg:col-span-1">
                <TopClientsCard clients={stats?.topClients || []} />
              </div>

              {/* Distribution des statuts */}
              <div className="lg:col-span-1">
                <StatusDistributionCard
                  title="Statuts des Commandes"
                  data={stats?.commandesParStatut || []}
                  type="commandes"
                />
              </div>
            </div>

            {/* Seconde ligne de graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution des produits */}
              <StatusDistributionCard
                title="Statuts des Produits"
                data={stats?.produitsParStatut || []}
                type="produits"
              />

              {/* Actions rapides */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href="/commandes" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Voir toutes les commandes
                      </Button>
                    </Link>
                    <Link href="/commandes/create" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle commande
                      </Button>
                    </Link>
                    <Link href="/clients" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Gérer les clients
                      </Button>
                    </Link>
                    <Link href="/pc-suivi" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Monitor className="h-4 w-4 mr-2" />
                        Suivi des PC
                      </Button>
                    </Link>
                    <Link href="/produits" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="h-4 w-4 mr-2" />
                        Gérer les produits
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer informations */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')} •{' '}
              Actualisation automatique toutes les 30 secondes
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
