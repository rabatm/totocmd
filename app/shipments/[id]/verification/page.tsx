'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useShipment } from '@/hooks/useShipments';
import { useShipmentWorkflow } from '@/hooks/useShipmentWorkflow';
import { ShipmentProduit, ShipmentWithDetails } from '@/src/types';
import {
  ArrowLeft,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Eye,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShipmentVerificationPageProps {
  params: Promise<{ id: string }>;
}

interface ProductVerificationStatus {
  product: ShipmentProduit;
  verified: boolean;
  hasIssue: boolean;
  issueDescription: string;
}

export default function ShipmentVerificationPage({ params }: ShipmentVerificationPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: shipmentResponse, isLoading } = useShipment(Number(id));
  const shipment = shipmentResponse?.data;
  const workflow = useShipmentWorkflow(shipment as ShipmentWithDetails);

  const [observations, setObservations] = useState('');
  const [verificationProducts, setVerificationProducts] = useState<ProductVerificationStatus[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialisation des produits
  useEffect(() => {
    if (shipment?.shipment_produits) {
      setVerificationProducts(
        shipment?.shipment_produits.map(product => ({
          product,
          verified: false,
          hasIssue: false,
          issueDescription: ''
        }))
      );
    }
  }, [shipment]);

  const handleProductVerification = (index: number, verified: boolean) => {
    setVerificationProducts(prev => {
      const newProducts = [...prev];
      newProducts[index].verified = verified;

      if (verified) {
        // Si vérifié avec succès, reset les problèmes
        newProducts[index].hasIssue = false;
        newProducts[index].issueDescription = '';
      }

      return newProducts;
    });
  };

  const handleProductIssue = (index: number, hasIssue: boolean) => {
    setVerificationProducts(prev => {
      const newProducts = [...prev];
      newProducts[index].hasIssue = hasIssue;

      if (!hasIssue) {
        newProducts[index].issueDescription = '';
      } else {
        newProducts[index].verified = false; // Ne peut pas être vérifié s'il y a un problème
      }

      return newProducts;
    });
  };

  const handleIssueDescription = (index: number, description: string) => {
    setVerificationProducts(prev => {
      const newProducts = [...prev];
      newProducts[index].issueDescription = description;
      return newProducts;
    });
  };

  const verifiedCount = verificationProducts.filter(item => item.verified).length;
  const issueCount = verificationProducts.filter(item => item.hasIssue).length;
  const totalCount = verificationProducts.length;
  const allVerified = verifiedCount === totalCount;
  const hasIssues = issueCount > 0;

  const canApprove = allVerified && !hasIssues;
  const shouldReject = hasIssues;

  const handleApproveVerification = async () => {
    if (!canApprove) {
      toast.error('Tous les produits doivent être vérifiés sans problème');
      return;
    }

    try {
      await workflow.completeVerification(observations || undefined, true);
      toast.success('Vérification approuvée avec succès !');
      router.push(`/shipments/${id}`);
    } catch {
      toast.error('Erreur lors de l\'approbation de la vérification');
    }
  };

  const handleRejectVerification = async () => {
    const rejectionReason = verificationProducts
      .filter(item => item.hasIssue)
      .map(item => `${item.product.commande_produit?.nom_produit}: ${item.issueDescription}`)
      .join('; ');

    const fullObservations = `${observations ? observations + '. ' : ''}Problèmes détectés: ${rejectionReason}`;

    try {
      await workflow.completeVerification(fullObservations, false);
      toast.success('Expédition renvoyée en préparation');
      router.push(`/shipments/${id}`);
    } catch {
      toast.error('Erreur lors du renvoi en préparation');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
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

  if (shipment?.statut !== 'preparee') {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Interface non disponible
            </h1>
            <p className="text-gray-600 mb-6">
              Cette expédition n&apos;est pas prête pour la vérification.
              <br />
              Statut actuel: {shipment?.statut}
            </p>
            <Link href={`/shipments/${id}`}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l&apos;expédition
              </Button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/shipments/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="h-6 w-6 text-blue-600" />
                Vérification - {shipment?.numero_facture}
              </h1>
              <p className="text-gray-600">
                Client: {shipment?.client} • Vérificateur: {shipment?.verificateur}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="font-medium">{shipment?.verificateur}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Zone d'actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Contrôle qualité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informations sur la préparation */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Informations préparation</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>Préparateur: {shipment.preparateur}</div>
                    {shipment.date_preparation && (
                      <div>Préparée: {formatDate(shipment.date_preparation)}</div>
                    )}
                  </div>
                </div>

                {/* Progression */}
                <div className="pt-4 border-t">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Vérifiés</span>
                        <span className="text-sm text-gray-500">
                          {verifiedCount}/{totalCount}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(verifiedCount / totalCount) * 100}%` }}
                        />
                      </div>
                    </div>

                    {issueCount > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-red-600">Problèmes</span>
                          <span className="text-sm text-red-500">{issueCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(issueCount / totalCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observations */}
                <div className="pt-4 border-t">
                  <Textarea
                    placeholder="Observations sur la vérification..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t space-y-2">
                  <Button
                    onClick={handleApproveVerification}
                    disabled={!canApprove || workflow.isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approuver ({verifiedCount}/{totalCount})
                  </Button>

                  {shouldReject && (
                    <Button
                      onClick={handleRejectVerification}
                      disabled={workflow.isProcessing}
                      variant="destructive"
                      className="w-full"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Renvoyer en préparation
                    </Button>
                  )}

                  {!canApprove && !shouldReject && (
                    <div className="text-center py-2">
                      <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                      <p className="text-sm text-amber-700">
                        Vérifiez tous les produits pour continuer
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des produits à vérifier */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produits à vérifier ({verificationProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verificationProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun produit à vérifier</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verificationProducts.map((item, index) => (
                      <div
                        key={item.product.id}
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          item.verified
                            ? 'bg-green-50 border-green-200'
                            : item.hasIssue
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Informations produit */}
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">
                                {item.product.commande_produit?.nom_produit || 'Produit inconnu'}
                              </h3>
                              <div className="text-sm text-gray-500 space-y-1 mt-1">
                                {item.product.commande_produit?.code_produit && (
                                  <div>Code: {item.product.commande_produit.code_produit}</div>
                                )}
                                {item.product.commande_produit?.numero_serie && (
                                  <div>N° série: {item.product.commande_produit.numero_serie}</div>
                                )}
                                <div>Quantité expédiée: {item.product.quantite_expediee}</div>
                                <div>Prix: {item.product.prix_unitaire_ttc.toFixed(2)} € TTC</div>
                              </div>
                            </div>

                            <Badge
                              variant={
                                item.verified
                                  ? 'default'
                                  : item.hasIssue
                                  ? 'destructive'
                                  : 'outline'
                              }
                              className={
                                item.verified
                                  ? 'bg-green-100 text-green-800'
                                  : item.hasIssue
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-600'
                              }
                            >
                              {item.verified
                                ? 'Vérifié'
                                : item.hasIssue
                                ? 'Problème'
                                : 'En attente'
                              }
                            </Badge>
                          </div>

                          <Separator />

                          {/* Actions de vérification */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`verified-${index}`}
                                    checked={item.verified}
                                    onCheckedChange={(checked) =>
                                      handleProductVerification(index, !!checked)
                                    }
                                    disabled={item.hasIssue}
                                    className="data-[state=checked]:bg-green-600"
                                  />
                                  <label
                                    htmlFor={`verified-${index}`}
                                    className="text-sm font-medium text-green-700"
                                  >
                                    Produit conforme
                                  </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`issue-${index}`}
                                    checked={item.hasIssue}
                                    onCheckedChange={(checked) =>
                                      handleProductIssue(index, !!checked)
                                    }
                                    disabled={item.verified}
                                    className="data-[state=checked]:bg-red-600"
                                  />
                                  <label
                                    htmlFor={`issue-${index}`}
                                    className="text-sm font-medium text-red-700"
                                  >
                                    Signaler un problème
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Zone de description du problème */}
                            {item.hasIssue && (
                              <div className="bg-red-50 p-3 rounded border border-red-200">
                                <label className="block text-sm font-medium text-red-800 mb-2">
                                  Décrivez le problème détecté :
                                </label>
                                <Textarea
                                  placeholder="Ex: Produit endommagé, mauvaise référence, quantité incorrecte..."
                                  value={item.issueDescription}
                                  onChange={(e) => handleIssueDescription(index, e.target.value)}
                                  rows={2}
                                  className="bg-white border-red-300 focus:border-red-500"
                                />
                              </div>
                            )}

                            {/* Message de confirmation */}
                            {item.verified && (
                              <div className="bg-green-50 p-2 rounded border border-green-200 text-center">
                                <div className="flex items-center justify-center gap-2 text-green-700">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="text-sm font-medium">Produit vérifié avec succès</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}