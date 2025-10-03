'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ShipmentCard from '@/components/shipments/ShipmentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useShipments } from '@/hooks/useShipments';
import { ShipmentStatusLabels } from '@/src/types';
import { Package, Search, Filter, Truck, Users, TrendingUp } from 'lucide-react';

export default function ShipmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [preparateurFilter, setPreparateurFilter] = useState<string>('all');

  const filters = {
    search: search.trim() || undefined,
    statut: statusFilter !== 'all' ? statusFilter : undefined,
    preparateur: preparateurFilter !== 'all' ? preparateurFilter : undefined,
  };

  const { data: shipmentsResponse, isLoading } = useShipments(filters);

  // Extraire les données de la réponse
  const shipments = shipmentsResponse?.data || [];

  // Statistiques globales
  const getStats = () => {
    if (!shipments || shipments.length === 0) return null;

    const stats = {
      total: shipments.length,
      brouillon: 0,
      'En préparation': 0,
      preparee: 0,
      verifiee: 0,
      expediee: 0,
      'En transit': 0,
      livree: 0
    };

    const preparateurs = new Set<string>();

    shipments.forEach(shipment => {
      if (stats.hasOwnProperty(shipment.statut)) {
        stats[shipment.statut as keyof typeof stats]++;
      }
      if (shipment.preparateur) {
        preparateurs.add(shipment.preparateur);
      }
    });

    return {
      ...stats,
      preparateurs: Array.from(preparateurs)
    };
  };

  const stats = getStats();

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPreparateurFilter('all');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Truck className="h-8 w-8 text-blue-600" />
                Expéditions
              </h1>
              <p className="text-gray-600 mt-2">
                Gestion des expéditions et workflow de préparation
              </p>
            </div>
          </div>

          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">En préparation</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats['En préparation'] + stats.brouillon}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expédiées</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.expediee + stats['En transit'] + stats.livree}
                      </p>
                    </div>
                    <Truck className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Préparateurs</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.preparateurs.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtres */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par numéro, client..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(ShipmentStatusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={preparateurFilter} onValueChange={setPreparateurFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les préparateurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les préparateurs</SelectItem>
                    {stats?.preparateurs.map((preparateur) => (
                      <SelectItem key={preparateur} value={preparateur}>
                        {preparateur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={search === '' && statusFilter === 'all' && preparateurFilter === 'all'}
                >
                  Effacer les filtres
                </Button>
              </div>

              {/* Filtres actifs */}
              {(search || statusFilter !== 'all' || preparateurFilter !== 'all') && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {search && (
                    <Badge variant="secondary">
                      Recherche: "{search}"
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary">
                      Statut: {ShipmentStatusLabels[statusFilter as keyof typeof ShipmentStatusLabels]}
                    </Badge>
                  )}
                  {preparateurFilter !== 'all' && (
                    <Badge variant="secondary">
                      Préparateur: {preparateurFilter}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Liste des expéditions */}
        <div className="space-y-4">
          {!shipments || shipments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {(search || statusFilter !== 'all' || preparateurFilter !== 'all')
                      ? 'Aucune expédition trouvée'
                      : 'Aucune expédition'
                    }
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {(search || statusFilter !== 'all' || preparateurFilter !== 'all')
                      ? 'Essayez de modifier vos critères de recherche.'
                      : 'Les expéditions créées depuis les commandes apparaîtront ici.'
                    }
                  </p>
                  {(search || statusFilter !== 'all' || preparateurFilter !== 'all') && (
                    <Button variant="outline" onClick={clearFilters}>
                      Effacer les filtres
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {shipments.length} expédition{shipments.length !== 1 ? 's' : ''} trouvée{shipments.length !== 1 ? 's' : ''}
                </p>
              </div>

              {shipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  showCommande={true}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}