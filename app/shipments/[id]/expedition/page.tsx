'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useShipment } from '@/hooks/useShipments';
import { useShipmentWorkflow } from '@/hooks/useShipmentWorkflow';
import {
  ArrowLeft,
  Package,
  Truck,
  Send,
  AlertCircle,
  Clock,
  User,
  Printer,
  CheckCircle2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShipmentExpeditionPageProps {
  params: Promise<{ id: string }>;
}

export default function ShipmentExpeditionPage({ params }: ShipmentExpeditionPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: shipment, isLoading } = useShipment(id);
  const workflow = useShipmentWorkflow(shipment!);

  const [formData, setFormData] = useState({
    numeroFacture: '',
    transporteur: '',
    numeroSuivi: '',
    observations: '',
    dateExpedition: new Date().toISOString().split('T')[0],
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [printingLabel, setPrintingLabel] = useState(false);

  // Mise à jour de l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialisation du formulaire
  useEffect(() => {
    if (shipment) {
      setFormData(prev => ({
        ...prev,
        numeroFacture: shipment.numero_facture || '',
        transporteur: shipment.transporteur || 'Chronopost',
        numeroSuivi: shipment.suivi_chronopost || '',
      }));
    }
  }, [shipment]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingNumber = `${formData.transporteur.substring(0, 2).toUpperCase()}${timestamp.slice(-8)}${random}`;
    handleInputChange('numeroSuivi', trackingNumber);
    toast.success('Numéro de suivi généré');
  };

  const handlePrintLabel = async () => {
    setPrintingLabel(true);
    try {
      // Simulation d'impression d'étiquette
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Étiquette d\'expédition imprimée');
    } catch (error) {
      toast.error('Erreur lors de l\'impression');
    } finally {
      setPrintingLabel(false);
    }
  };

  const handleFinalizeShipment = async () => {
    if (!formData.numeroFacture.trim()) {
      toast.error('Le numéro de facture est obligatoire');
      return;
    }

    if (!formData.numeroSuivi.trim()) {
      toast.error('Le numéro de suivi Chronopost est obligatoire');
      return;
    }

    try {
      const finalObservations = [
        formData.observations,
        `Transporteur: ${formData.transporteur}`,
        `Date d'expédition: ${formData.dateExpedition}`,
      ].filter(Boolean).join(' - ');

      await workflow.finalizeShipment({
        numero_facture: formData.numeroFacture,
        numero_suivi_chronopost: formData.numeroSuivi,
        transporteur: formData.transporteur,
        observations: finalObservations,
      });

      toast.success('Expédition finalisée avec succès !');
      router.push(`/shipments/${id}`);
    } catch (error) {
      toast.error('Erreur lors de la finalisation de l\'expédition');
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

  if (shipment.statut !== 'verifiee') {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Interface non disponible
            </h1>
            <p className="text-gray-600 mb-6">
              Cette expédition n'est pas prête pour l'expédition finale.
              <br />
              Statut actuel: {shipment.statut}
            </p>
            <Link href={`/shipments/${id}`}>
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'expédition
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

  const canFinalize = formData.numeroFacture.trim().length > 0 && formData.numeroSuivi.trim().length > 0;
  const products = shipment.shipment_produits || [];

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
                <Send className="h-6 w-6 text-blue-600" />
                Expédition finale - {shipment.numero_facture}
              </h1>
              <p className="text-gray-600">
                Client: {shipment.client}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              Prête pour expédition
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulaire d'expédition */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informations d'expédition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Numéro de facture */}
                <div className="space-y-2">
                  <Label htmlFor="numeroFacture">
                    Numéro de facture *
                  </Label>
                  <Input
                    id="numeroFacture"
                    value={formData.numeroFacture}
                    onChange={(e) => handleInputChange('numeroFacture', e.target.value)}
                    placeholder="Ex: FA-2025-001234"
                    className="font-mono"
                  />
                  <p className="text-sm text-gray-500">
                    Numéro de facture associé à cette expédition
                  </p>
                </div>

                <Separator />

                {/* Transporteur et date */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transporteur">Transporteur</Label>
                    <Select
                      value={formData.transporteur}
                      onValueChange={(value) => handleInputChange('transporteur', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chronopost">Chronopost</SelectItem>
                        <SelectItem value="Colissimo">Colissimo</SelectItem>
                        <SelectItem value="DHL">DHL Express</SelectItem>
                        <SelectItem value="UPS">UPS</SelectItem>
                        <SelectItem value="GLS">GLS</SelectItem>
                        <SelectItem value="Mondial Relay">Mondial Relay</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateExpedition">Date d'expédition</Label>
                    <Input
                      id="dateExpedition"
                      type="date"
                      value={formData.dateExpedition}
                      onChange={(e) => handleInputChange('dateExpedition', e.target.value)}
                    />
                  </div>
                </div>

                {/* Numéro de suivi Chronopost */}
                <div className="space-y-2">
                  <Label htmlFor="numeroSuivi">
                    Numéro de suivi Chronopost *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="numeroSuivi"
                      value={formData.numeroSuivi}
                      onChange={(e) => handleInputChange('numeroSuivi', e.target.value)}
                      placeholder="Ex: XX12345678901234567"
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateTrackingNumber}
                    >
                      Générer
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Numéro de suivi pour le tracking Chronopost
                  </p>
                </div>

                {/* URL de suivi automatique */}
                {formData.numeroSuivi && formData.transporteur === 'Chronopost' && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Lien de suivi automatique :</strong>
                    </p>
                    <a
                      href={`https://www.chronopost.fr/tracking-colis?listeNumerosLT=${formData.numeroSuivi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
                    >
                      https://www.chronopost.fr/tracking-colis?listeNumerosLT={formData.numeroSuivi}
                    </a>
                  </div>
                )}

                <Separator />

                {/* Observations */}
                <div className="space-y-2">
                  <Label htmlFor="observations">Observations sur l'expédition</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    placeholder="Notes, instructions spéciales, conditions de transport..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Récapitulatif des produits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Récapitulatif des produits ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.commande_produit?.nom_produit || 'Produit inconnu'}
                        </p>
                        <div className="text-sm text-gray-500">
                          {item.commande_produit?.code_produit && (
                            <span>Code: {item.commande_produit.code_produit} • </span>
                          )}
                          {item.commande_produit?.numero_serie && (
                            <span>Série: {item.commande_produit.numero_serie} • </span>
                          )}
                          <span>Qté: {item.quantite_expediee}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.prix_unitaire_ttc.toFixed(2)} € TTC</p>
                        <p className="text-sm text-gray-500">
                          Total: {(item.prix_unitaire_ttc * item.quantite_expediee).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions d'expédition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handlePrintLabel}
                  disabled={printingLabel || !canFinalize}
                  variant="outline"
                  className="w-full"
                >
                  {printingLabel ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4 mr-2" />
                  )}
                  Imprimer l'étiquette
                </Button>

                <Button
                  onClick={handleFinalizeShipment}
                  disabled={!canFinalize || workflow.isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {workflow.isProcessing ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Finaliser l'expédition
                </Button>

                {!canFinalize && (
                  <div className="text-center py-2">
                    <AlertCircle className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                    <p className="text-sm text-amber-700">
                      {!formData.numeroFacture.trim() && 'Numéro de facture requis'}
                      {formData.numeroFacture.trim() && !formData.numeroSuivi.trim() && 'Numéro de suivi requis'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{shipment.client}</p>
                  {shipment.commandes?.clients && (
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      {shipment.commandes.clients.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {shipment.commandes.clients.email}
                        </div>
                      )}
                      {shipment.commandes.clients.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {shipment.commandes.clients.phone}
                        </div>
                      )}
                      {shipment.commandes.clients.address && (
                        <div className="flex items-start gap-2 mt-2">
                          <MapPin className="h-3 w-3 mt-0.5" />
                          <div className="text-xs">
                            <div>{shipment.commandes.clients.address}</div>
                            {(shipment.commandes.clients.postal_code || shipment.commandes.clients.city) && (
                              <div>
                                {shipment.commandes.clients.postal_code} {shipment.commandes.clients.city}
                              </div>
                            )}
                            {shipment.commandes.clients.country && (
                              <div>{shipment.commandes.clients.country}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chronologie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chronologie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-green-600 font-medium">Créée:</span>
                    <span>{formatDate(shipment.created_at)}</span>
                  </div>

                  {shipment.date_preparation && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-green-600 font-medium">Préparée:</span>
                      <span>{formatDate(shipment.date_preparation)}</span>
                    </div>
                  )}

                  {shipment.date_verification && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-green-600 font-medium">Vérifiée:</span>
                      <span>{formatDate(shipment.date_verification)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-blue-600 font-medium">En cours:</span>
                    <span>Finalisation expédition</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Totaux */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total expédition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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