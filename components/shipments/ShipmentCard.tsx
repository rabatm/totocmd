'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShipmentWithDetails, ShipmentStatusLabels, ShipmentStatusColors } from '@/src/types';
import { Package, Truck, Eye, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import ColisManagement from './ColisManagement';
import SuiviChronopost from './SuiviChronopost';

interface ShipmentCardProps {
  shipment: ShipmentWithDetails;
  showCommande?: boolean;
}

export default function ShipmentCard({ shipment, showCommande = false }: ShipmentCardProps) {
  const getStatusColor = (status: string) => {
    return ShipmentStatusColors[status as keyof typeof ShipmentStatusColors] || 'gray';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { key: 'brouillon', label: 'Brouillon', completed: false },
      { key: 'En préparation', label: 'Préparation', completed: false },
      { key: 'preparee', label: 'Préparée', completed: false },
      { key: 'verifiee', label: 'Vérifiée', completed: false },
      { key: 'expediee', label: 'Expédiée', completed: false },
    ];

    const statusOrder = ['brouillon', 'En préparation', 'preparee', 'verifiee', 'expediee', 'En transit', 'livree'];
    const currentIndex = statusOrder.indexOf(shipment.statut);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex
    }));
  };

  const productCount = shipment.shipment_produits?.length || 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              {shipment.numero_facture || shipment.fa_bl_number}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{shipment.client}</span>
              {showCommande && shipment.commande && (
                <>
                  <span>•</span>
                  <span>Commande #{shipment.commande.numero_commande}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`bg-${getStatusColor(shipment.statut)}-100 text-${getStatusColor(shipment.statut)}-800 border-${getStatusColor(shipment.statut)}-300`}
            >
              {ShipmentStatusLabels[shipment.statut as keyof typeof ShipmentStatusLabels]}
            </Badge>
            <Link href={`/shipments/${shipment.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Informations principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Préparateur</p>
              <p className="font-medium">{shipment.preparateur}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Vérificateur</p>
              <p className="font-medium">{shipment.verificateur}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Transporteur</p>
              <p className="font-medium">{shipment.transporteur || 'Chronopost'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Produits</p>
              <p className="font-medium">{productCount} article{productCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Dates importantes */}
        {(shipment.date_preparation || shipment.date_verification || shipment.date_envoi) && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Dates importantes</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              {shipment.date_preparation && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-green-600" />
                  <span className="text-muted-foreground">Préparée:</span>
                  <span className="font-medium">{formatDate(shipment.date_preparation)}</span>
                </div>
              )}
              {shipment.date_verification && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-blue-600" />
                  <span className="text-muted-foreground">Vérifiée:</span>
                  <span className="font-medium">{formatDate(shipment.date_verification)}</span>
                </div>
              )}
              {shipment.date_envoi && shipment.statut === 'expediee' && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-purple-600" />
                  <span className="text-muted-foreground">Expédiée:</span>
                  <span className="font-medium">{formatDate(shipment.date_envoi)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gestion Multi-Colis avec Tracking Chronopost */}
        <div className="space-y-4">
          <SuiviChronopost
            shipmentId={shipment.id}
            canEdit={shipment.statut !== 'expediee'}
          />

          <ColisManagement
            shipmentId={shipment.id}
            canEdit={shipment.statut === 'brouillon'}
          />
        </div>

        {/* Totaux */}
        {(shipment.total_ttc > 0 || shipment.total_ht > 0) && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Total expédition</span>
            <div className="text-right">
              {shipment.total_ht > 0 && (
                <p className="text-sm text-muted-foreground">
                  {shipment.total_ht.toFixed(2)} € HT
                </p>
              )}
              <p className="font-semibold">
                {shipment.total_ttc.toFixed(2)} € TTC
              </p>
            </div>
          </div>
        )}

        {/* Observations */}
        {shipment.observations && (
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">Observations</p>
            <p className="text-sm text-muted-foreground">{shipment.observations}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}