'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateShipmentDialog from './CreateShipmentDialog';
import ShipmentCard from './ShipmentCard';
import { useShipments } from '@/hooks/useShipments';
import { CommandeWithDetails } from '@/src/types';
import { Package, Plus, Truck } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface CommandeShipmentsProps {
  commande: CommandeWithDetails;
}

export default function CommandeShipments({ commande }: CommandeShipmentsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  // Récupérer les expéditions de cette commande
  const { data: allShipments, isLoading, error } = useShipments();


  const commandeShipments = allShipments?.data?.filter(
    shipment => shipment.commande_id === commande.id
  ) || [];

  // Vérifier si on peut créer une expédition
  const canCreateShipment = () => {
    // Le bouton est toujours visible s'il y a des produits dans la commande
    // Peu importe leur statut, ils peuvent être expédiés
    return (commande.commande_produits || []).length > 0;
  };

  // Statistiques des expéditions
  const getShipmentStats = () => {
    const stats = {
      brouillon: 0,
      'En préparation': 0,
      preparee: 0,
      verifiee: 0,
      expediee: 0,
      'En transit': 0,
      livree: 0
    };

    commandeShipments.forEach(shipment => {
      if (stats.hasOwnProperty(shipment.statut)) {
        stats[shipment.statut as keyof typeof stats]++;
      }
    });

    return stats;
  };

  const stats = getShipmentStats();
  const hasShipments = commandeShipments.length > 0;

  const handleShipmentCreated = (shipmentId: number) => {
    setShowCreateDialog(false);
    // Optionnel: rediriger vers le détail de l'expédition
    // router.push(`/shipments/${shipmentId}`);
  };

  // Si erreur (table n'existe pas), on affiche quand même l'interface
  if (error) {
    console.warn('Erreur lors du chargement des expéditions:', error);
  }

  if (isLoading && !error) {
    return (
      <Card className="rounded-xl shadow bg-white">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Expéditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="rounded-xl shadow bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Expéditions ({commandeShipments.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer expédition
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!hasShipments ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune expédition
            </h3>
            <p className="text-gray-600 mb-4">
              Cette commande n'a pas encore d'expédition créée.
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer la première expédition
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Statistiques des expéditions */}
            <div className="flex flex-wrap gap-2">
              {stats.brouillon > 0 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {stats.brouillon} brouillon{stats.brouillon > 1 ? 's' : ''}
                </Badge>
              )}
              {stats['En préparation'] > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {stats['En préparation']} en préparation
                </Badge>
              )}
              {stats.preparee > 0 && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {stats.preparee} préparée{stats.preparee > 1 ? 's' : ''}
                </Badge>
              )}
              {stats.verifiee > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {stats.verifiee} vérifiée{stats.verifiee > 1 ? 's' : ''}
                </Badge>
              )}
              {stats.expediee > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {stats.expediee} expédiée{stats.expediee > 1 ? 's' : ''}
                </Badge>
              )}
              {stats['En transit'] > 0 && (
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {stats['En transit']} en transit
                </Badge>
              )}
              {stats.livree > 0 && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                  {stats.livree} livrée{stats.livree > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Liste des expéditions */}
            <div className="space-y-3">
              {commandeShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  showCommande={false}
                />
              ))}
            </div>

            {/* Message informatif sur les produits disponibles */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">
                  Produits de la commande
                </p>
              </div>
              <p className="text-sm text-blue-700">
                {(commande.commande_produits || []).length} produit{(commande.commande_produits || []).length !== 1 ? 's' : ''} dans cette commande peuvent être expédié{(commande.commande_produits || []).length !== 1 ? 's' : ''}.
                <br />
                <span className="text-xs">Lors de l'expédition, le statut des produits sera automatiquement mis à jour vers "expédié".</span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Dialog de création d'expédition */}
    {showCreateDialog && (
      <CreateShipmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        commande={commande}
      />
    )}
  </>
  );
}