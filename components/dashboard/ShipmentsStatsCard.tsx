'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShipments } from '@/hooks/useShipments';
import { ShipmentStatusLabels, ShipmentStatusColors } from '@/src/types';
import {
  Truck,
  Clock,
  Package,
  CheckCircle,
  AlertTriangle,
  Eye,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function ShipmentsStatsCard() {
  const { data, isLoading } = useShipments();

  // Calcul des statistiques
  const stats = useMemo(() => {
    if (!data?.data) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const statusCounts = {
      brouillon: 0,
      'En préparation': 0,
      preparee: 0,
      verifiee: 0,
      expediee: 0,
      'En transit': 0,
      livree: 0
    };

    let totalValue = 0;
    let todayShipments = 0;
    let weekShipments = 0;
    let overdueShipments = 0;

    data.data.forEach(shipment => {
      // Comptage par statut
      if (statusCounts.hasOwnProperty(shipment.statut)) {
        statusCounts[shipment.statut as keyof typeof statusCounts]++;
      }

      // Valeur totale
      totalValue += shipment.total_ttc || 0;

      // Expéditions du jour
      if (shipment.created_at) {
        const shipmentDate = new Date(shipment.created_at);
        if (shipmentDate >= today) {
          todayShipments++;
        }
        if (shipmentDate >= weekAgo) {
          weekShipments++;
        }
      }

      // Expéditions en retard (plus de 48h en préparation)
      if ((shipment.statut === 'En préparation' || shipment.statut === 'brouillon') && shipment.created_at) {
        const shipmentDate = new Date(shipment.created_at);
        const hoursOld = (now.getTime() - shipmentDate.getTime()) / (1000 * 60 * 60);
        if (hoursOld > 48) {
          overdueShipments++;
        }
      }
    });

    const pendingCount = statusCounts.brouillon + statusCounts['En préparation'] + statusCounts.preparee + statusCounts.verifiee;
    const completedCount = statusCounts.expediee + statusCounts['En transit'] + statusCounts.livree;

    return {
      total: data.data.length,
      pending: pendingCount,
      completed: completedCount,
      overdue: overdueShipments,
      todayCount: todayShipments,
      weekCount: weekShipments,
      totalValue,
      statusCounts,
      avgValue: data.data.length > 0 ? totalValue / data.data.length : 0
    };
  }, [data]);

  const getStatusColor = (status: string) => {
    return ShipmentStatusColors[status as keyof typeof ShipmentStatusColors] || 'gray';
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Expéditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Expéditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Aucune expédition</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Expéditions ({stats.total})
          </CardTitle>
          <Link href="/shipments">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Voir tout
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">En attente</span>
            </div>
            <div className="text-2xl font-bold text-orange-800">{stats.pending}</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Terminées</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{stats.completed}</div>
          </div>
        </div>

        {/* Alertes */}
        {stats.overdue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Attention</span>
            </div>
            <p className="text-sm text-red-700">
              {stats.overdue} expédition{stats.overdue > 1 ? 's' : ''} en retard (plus de 48h)
            </p>
            <Link href="/shipments?statut=En préparation" className="mt-2 inline-block">
              <Button size="sm" variant="destructive">
                Voir les retards
              </Button>
            </Link>
          </div>
        )}

        {/* Répartition par statut */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Répartition par statut
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.statusCounts).map(([status, count]) => {
              if (count === 0) return null;

              const color = getStatusColor(status);
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                    <span className="text-sm">
                      {ShipmentStatusLabels[status as keyof typeof ShipmentStatusLabels] || status}
                    </span>
                  </div>
                  <Badge variant="secondary" className={`bg-${color}-100 text-${color}-800`}>
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistiques financières */}
        {stats.totalValue > 0 && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Valeur totale</p>
                <p className="font-bold text-lg">{stats.totalValue.toFixed(0)} €</p>
              </div>
              <div>
                <p className="text-gray-600">Valeur moyenne</p>
                <p className="font-bold text-lg">{stats.avgValue.toFixed(0)} €</p>
              </div>
            </div>
          </div>
        )}

        {/* Activité récente */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Activité récente</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Aujourd'hui</p>
              <p className="font-semibold">{stats.todayCount} expédition{stats.todayCount > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-gray-600">Cette semaine</p>
              <p className="font-semibold">{stats.weekCount} expédition{stats.weekCount > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-2">
          <Link href="/commandes" className="block">
            <Button variant="outline" size="sm" className="w-full">
              <Package className="h-4 w-4 mr-2" />
              Créer une expédition
            </Button>
          </Link>
          {stats.pending > 0 && (
            <Link href="/shipments?statut=En préparation" className="block">
              <Button variant="outline" size="sm" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Gérer les préparations
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}