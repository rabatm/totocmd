'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useShipment } from '@/hooks/useShipments';
import { useShipmentWorkflow } from '@/hooks/useShipmentWorkflow';
import { ShipmentStatusLabels, ShipmentStatusColors } from '@/src/types';
import {
  ArrowLeft,
  Package,
  User,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Eye,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: shipment, isLoading } = useShipment(id);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const workflow = useShipmentWorkflow(shipment!);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const getStatusColor = (status: string) => {
    return ShipmentStatusColors[status as keyof typeof ShipmentStatusColors] || 'gray';
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-96 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!shipment) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Expédition introuvable
            </h1>
            <p className="text-gray-600 mb-6">
              L'expédition demandée n'existe pas ou a été supprimée.
            </p>
            <Link href="/shipments">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux expéditions
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const nextActions = workflow.getNextActions();
  const products = shipment.shipment_produits || [];
  const displayedProducts = showAllProducts ? products : products.slice(0, 5);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/shipments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {shipment.numero_facture || shipment.fa_bl_number}
              </h1>
              <p className="text-gray-600">
                Expédition pour {shipment.client}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={`bg-${getStatusColor(shipment.statut)}-100 text-${getStatusColor(shipment.statut)}-800 border-${getStatusColor(shipment.statut)}-300`}
            >
              {ShipmentStatusLabels[shipment.statut as keyof typeof ShipmentStatusLabels]}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Client</label>
                    <p className="font-medium">{shipment.client}</p>
                    {shipment.commandes?.clients && (
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        {shipment.commandes.clients.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {shipment.commandes.clients.email}
                          </div>
                        )}
                        {shipment.commandes.clients.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {shipment.commandes.clients.phone}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Commande associée</label>
                    {shipment.commandes ? (
                      <Link
                        href={`/commandes/${shipment.commandes.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        #{shipment.commandes.numero_commande}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-400">Non liée</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Préparateur</p>
                      <p className="font-medium">{shipment.preparateur}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Vérificateur</p>
                      <p className="font-medium">{shipment.verificateur}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Transporteur</p>
                      <p className="font-medium">{shipment.transporteur || 'Chronopost'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates importantes */}
                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Chronologie</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500">Créée:</span>
                      <span className="font-medium">{formatDate(shipment.created_at)}</span>
                    </div>

                    {shipment.date_preparation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span className="text-gray-500">Préparée:</span>
                        <span className="font-medium text-green-600">{formatDate(shipment.date_preparation)}</span>
                      </div>
                    )}

                    {shipment.date_verification && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span className="text-gray-500">Vérifiée:</span>
                        <span className="font-medium text-blue-600">{formatDate(shipment.date_verification)}</span>
                      </div>
                    )}

                    {shipment.date_envoi && shipment.statut === 'expediee' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3 w-3 text-purple-600" />
                        <span className="text-gray-500">Expédiée:</span>
                        <span className="font-medium text-purple-600">{formatDate(shipment.date_envoi)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observations */}
                {shipment.observations && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Observations</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                        {shipment.observations}
                      </div>
                    </div>
                  </>
                )}

                {/* Numéro de suivi */}
                {shipment.suivi_chronopost && (
                  <>
                    <Separator />
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">Numéro de suivi</p>
                          <p className="text-blue-700 font-mono text-sm">{shipment.suivi_chronopost}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://www.chronopost.fr/tracking-colis?listeNumerosLT=${shipment.suivi_chronopost}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Suivre le colis
                          </a>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Produits de l'expédition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produits ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun produit dans cette expédition</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>N° série</TableHead>
                          <TableHead>Qté expédiée</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayedProducts.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.commande_produit?.nom_produit || 'Produit inconnu'}
                            </TableCell>
                            <TableCell>
                              {item.commande_produit?.code_produit || '-'}
                            </TableCell>
                            <TableCell>
                              {item.commande_produit?.numero_serie || '-'}
                            </TableCell>
                            <TableCell>{item.quantite_expediee}</TableCell>
                            <TableCell>{item.prix_unitaire_ttc.toFixed(2)} €</TableCell>
                            <TableCell className="font-medium">
                              {(item.prix_unitaire_ttc * item.quantite_expediee).toFixed(2)} €
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {products.length > 5 && !showAllProducts && (
                      <div className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllProducts(true)}
                        >
                          Voir tous les produits ({products.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Actions de workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextActions.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium text-green-600">Expédition terminée</p>
                    <p className="text-xs text-gray-500">Aucune action disponible</p>
                  </div>
                ) : (
                  nextActions.map((action) => (
                    <Button
                      key={action.key}
                      variant={action.variant || 'default'}
                      size="sm"
                      onClick={action.action}
                      disabled={action.disabled || workflow.isProcessing}
                      className="w-full justify-start"
                    >
                      {action.label}
                    </Button>
                  ))
                )}

                {/* Actions spéciales selon le statut */}
                {shipment.statut === 'En préparation' && (
                  <Link href={`/shipments/${shipment.id}/preparation`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Interface de préparation
                    </Button>
                  </Link>
                )}

                {shipment.statut === 'preparee' && (
                  <Link href={`/shipments/${shipment.id}/verification`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Interface de vérification
                    </Button>
                  </Link>
                )}

                {shipment.statut === 'verifiee' && (
                  <Link href={`/shipments/${shipment.id}/expedition`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Interface d'expédition
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Totaux */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total HT</span>
                  <span className="font-medium">{shipment.total_ht.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVA</span>
                  <span className="font-medium">{shipment.total_tva.toFixed(2)} €</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total TTC</span>
                  <span className="font-bold">{shipment.total_ttc.toFixed(2)} €</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}