'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShipments } from '@/hooks/useShipments';
import { ShipmentStatusLabels } from '@/src/types';
import {
  AlertTriangle,
  Clock,
  User,
  Package,
  ArrowRight,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { format, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ShipmentsAlertsCard() {
  const { data, isLoading } = useShipments();

  // Calcul des expéditions en retard et prioritaires
  const alerts = useMemo(() => {
    if (!data?.data) return { overdue: [], urgent: [], slow: [] };

    const now = new Date();
    const overdue = [];
    const urgent = [];
    const slow = [];

    for (const shipment of data.data) {
      if (!shipment.created_at) continue;

      const createdAt = new Date(shipment.created_at);
      const hoursOld = differenceInHours(now, createdAt);

      // Expéditions en retard (plus de 48h)
      if (hoursOld > 48 && ['brouillon', 'En préparation'].includes(shipment.statut)) {
        overdue.push({ ...shipment, hoursOld });
      }
      // Expéditions urgentes (24-48h)
      else if (hoursOld > 24 && hoursOld <= 48 && ['brouillon', 'En préparation'].includes(shipment.statut)) {
        urgent.push({ ...shipment, hoursOld });
      }
      // Expéditions lentes en vérification (plus de 12h)
      else if (hoursOld > 12 && shipment.statut === 'preparee') {
        slow.push({ ...shipment, hoursOld });
      }
    }

    // Tri par ancienneté
    overdue.sort((a, b) => b.hoursOld - a.hoursOld);
    urgent.sort((a, b) => b.hoursOld - a.hoursOld);
    slow.sort((a, b) => b.hoursOld - a.hoursOld);

    return {
      overdue: overdue.slice(0, 5), // Max 5 items
      urgent: urgent.slice(0, 5),
      slow: slow.slice(0, 5)
    };
  }, [data]);

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}j ${remainingHours}h`;
  };

  const getUrgencyColor = (hours: number) => {
    if (hours > 72) return 'red';
    if (hours > 48) return 'orange';
    if (hours > 24) return 'yellow';
    return 'gray';
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Alertes expéditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAlerts = alerts.overdue.length + alerts.urgent.length + alerts.slow.length;

  if (totalAlerts === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-600" />
            Alertes expéditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-800 font-medium">Tout va bien !</p>
            <p className="text-sm text-green-600 mt-1">Aucune expédition en retard</p>
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
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Alertes expéditions ({totalAlerts})
          </CardTitle>
          {totalAlerts > 0 && (
            <Link href="/shipments">
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expéditions en retard critique */}
        {alerts.overdue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h4 className="font-medium text-red-800">En retard ({alerts.overdue.length})</h4>
            </div>
            <div className="space-y-2">
              {alerts.overdue.map((shipment) => (
                <div key={shipment.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-red-900 truncate">
                          {shipment.numero_facture || shipment.fa_bl_number}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {formatDuration(shipment.hoursOld)}
                        </Badge>
                      </div>
                      <div className="text-xs text-red-700 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {shipment.client}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ShipmentStatusLabels[shipment.statut as keyof typeof ShipmentStatusLabels]}
                        </div>
                      </div>
                    </div>
                    <Link href={`/shipments/${shipment.id}`}>
                      <Button size="sm" variant="destructive">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expéditions urgentes */}
        {alerts.urgent.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-amber-800">Urgentes ({alerts.urgent.length})</h4>
            </div>
            <div className="space-y-2">
              {alerts.urgent.map((shipment) => (
                <div key={shipment.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-amber-900 truncate">
                          {shipment.numero_facture || shipment.fa_bl_number}
                        </span>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                          {formatDuration(shipment.hoursOld)}
                        </Badge>
                      </div>
                      <div className="text-xs text-amber-700 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {shipment.client}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ShipmentStatusLabels[shipment.statut as keyof typeof ShipmentStatusLabels]}
                        </div>
                      </div>
                    </div>
                    <Link href={`/shipments/${shipment.id}`}>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vérifications lentes */}
        {alerts.slow.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">Vérification lente ({alerts.slow.length})</h4>
            </div>
            <div className="space-y-2">
              {alerts.slow.map((shipment) => (
                <div key={shipment.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-900 truncate">
                          {shipment.numero_facture || shipment.fa_bl_number}
                        </span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {formatDuration(shipment.hoursOld)}
                        </Badge>
                      </div>
                      <div className="text-xs text-blue-700 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {shipment.client}
                        </div>
                        <p>En attente de vérification</p>
                      </div>
                    </div>
                    <Link href={`/shipments/${shipment.id}/verification`}>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Actions rapides</h4>
          <div className="grid grid-cols-1 gap-2">
            {alerts.overdue.length > 0 && (
              <Link href="/shipments?statut=En préparation">
                <Button variant="destructive" size="sm" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Traiter les retards ({alerts.overdue.length})
                </Button>
              </Link>
            )}
            {alerts.slow.length > 0 && (
              <Link href="/shipments?statut=preparee">
                <Button variant="outline" size="sm" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  Vérifier les expéditions ({alerts.slow.length})
                </Button>
              </Link>
            )}
            <Link href="/shipments">
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Planning des expéditions
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}