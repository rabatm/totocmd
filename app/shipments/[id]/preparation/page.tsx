'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useShipment } from '@/hooks/useShipments';
import { useShipmentWorkflow } from '@/hooks/useShipmentWorkflow';
import { ShipmentProduit } from '@/src/types';
import {
  ArrowLeft,
  Package,
  Scan,
  Check,
  X,
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ShipmentPreparationPageProps {
  params: Promise<{ id: string }>;
}

interface ProductPreparationStatus {
  product: ShipmentProduit;
  scanned: boolean;
  currentQuantity: number;
  targetQuantity: number;
  completed: boolean;
}

export default function ShipmentPreparationPage({ params }: ShipmentPreparationPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: shipment, isLoading } = useShipment(id);
  const workflow = useShipmentWorkflow(shipment!);

  const [scanInput, setScanInput] = useState('');
  const [observations, setObservations] = useState('');
  const [preparationProducts, setPreparationProducts] = useState<ProductPreparationStatus[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mise à jour de l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialisation des produits
  useEffect(() => {
    if (shipment?.shipment_produits) {
      setPreparationProducts(
        shipment.shipment_produits.map(product => ({
          product,
          scanned: false,
          currentQuantity: 0,
          targetQuantity: product.quantite_expediee,
          completed: false
        }))
      );
    }
  }, [shipment]);

  const handleScan = (code: string) => {
    if (!code.trim()) return;

    const trimmedCode = code.trim().toLowerCase();

    // Rechercher le produit par code produit, numéro de série ou nom
    const foundIndex = preparationProducts.findIndex(item => {
      const product = item.product.commande_produit;
      if (!product) return false;

      return (
        product.code_produit?.toLowerCase() === trimmedCode ||
        product.numero_serie?.toLowerCase() === trimmedCode ||
        product.nom_produit.toLowerCase().includes(trimmedCode)
      );
    });

    if (foundIndex !== -1) {
      setPreparationProducts(prev => {
        const newProducts = [...prev];
        const item = newProducts[foundIndex];

        if (!item.completed && item.currentQuantity < item.targetQuantity) {
          item.scanned = true;
          item.currentQuantity += 1;
          item.completed = item.currentQuantity >= item.targetQuantity;

          if (item.completed) {
            toast.success(`✅ ${item.product.commande_produit?.nom_produit} - Préparation terminée`);
          } else {
            toast.success(`📦 ${item.product.commande_produit?.nom_produit} - ${item.currentQuantity}/${item.targetQuantity}`);
          }
        } else if (item.completed) {
          toast.warning(`⚠️ ${item.product.commande_produit?.nom_produit} - Déjà préparé`);
        }

        return newProducts;
      });
    } else {
      toast.error(`❌ Produit non trouvé: "${code}"`);
    }

    setScanInput('');
  };

  const handleManualToggle = (index: number) => {
    setPreparationProducts(prev => {
      const newProducts = [...prev];
      const item = newProducts[index];

      item.scanned = !item.scanned;

      if (item.scanned) {
        item.currentQuantity = item.targetQuantity;
        item.completed = true;
        toast.success(`✅ ${item.product.commande_produit?.nom_produit} - Marqué manuellement`);
      } else {
        item.currentQuantity = 0;
        item.completed = false;
        toast.info(`🔄 ${item.product.commande_produit?.nom_produit} - Remis en attente`);
      }

      return newProducts;
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setPreparationProducts(prev => {
      const newProducts = [...prev];
      const item = newProducts[index];

      const newQuantity = Math.max(0, Math.min(quantity, item.targetQuantity));
      item.currentQuantity = newQuantity;
      item.completed = newQuantity >= item.targetQuantity;
      item.scanned = newQuantity > 0;

      return newProducts;
    });
  };

  const canCompletePreparation = preparationProducts.every(item => item.completed);
  const completedCount = preparationProducts.filter(item => item.completed).length;
  const totalCount = preparationProducts.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleCompletePreparation = async () => {
    if (!canCompletePreparation) {
      toast.error('Tous les produits doivent être préparés');
      return;
    }

    try {
      await workflow.completePreparation(observations || undefined);
      toast.success('Préparation terminée avec succès !');
      router.push(`/shipments/${id}`);
    } catch (error) {
      toast.error('Erreur lors de la finalisation de la préparation');
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

  if (shipment.statut !== 'En préparation' && shipment.statut !== 'brouillon') {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Interface non disponible
            </h1>
            <p className="text-gray-600 mb-6">
              Cette expédition n'est pas en cours de préparation.
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
                <Package className="h-6 w-6 text-blue-600" />
                Préparation - {shipment.numero_facture}
              </h1>
              <p className="text-gray-600">
                Client: {shipment.client} • Préparateur: {shipment.preparateur}
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
              <span className="font-medium">{shipment.preparateur}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Zone de scan */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scanner code-barres, code produit..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleScan(scanInput);
                      }
                    }}
                    className="text-lg"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleScan(scanInput)}
                    disabled={!scanInput.trim()}
                    className="w-full"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Scanner
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm text-gray-500">
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {progressPercent.toFixed(0)}% terminé
                  </p>
                </div>

                {canCompletePreparation && (
                  <div className="pt-4 border-t">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Observations sur la préparation (optionnel)"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={3}
                      />
                      <Button
                        onClick={handleCompletePreparation}
                        disabled={workflow.isProcessing}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Terminer la préparation
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Liste des produits */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produits à préparer ({preparationProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preparationProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun produit à préparer</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {preparationProducts.map((item, index) => (
                      <div
                        key={item.product.id}
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          item.completed
                            ? 'bg-green-50 border-green-200'
                            : item.scanned
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300">
                              {item.completed ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : item.scanned ? (
                                <Clock className="h-4 w-4 text-blue-600" />
                              ) : (
                                <span className="text-xs font-medium">{index + 1}</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {item.product.commande_produit?.nom_produit || 'Produit inconnu'}
                              </h3>
                              <div className="text-sm text-gray-500 space-y-1">
                                {item.product.commande_produit?.code_produit && (
                                  <div>Code: {item.product.commande_produit.code_produit}</div>
                                )}
                                {item.product.commande_produit?.numero_serie && (
                                  <div>Série: {item.product.commande_produit.numero_serie}</div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Quantité</p>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max={item.targetQuantity}
                                  value={item.currentQuantity}
                                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                  className="w-16 text-center"
                                  size="sm"
                                />
                                <span className="text-sm text-gray-500">
                                  / {item.targetQuantity}
                                </span>
                              </div>
                            </div>

                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => handleManualToggle(index)}
                              className="data-[state=checked]:bg-green-600"
                            />

                            <Badge
                              variant={item.completed ? 'default' : item.scanned ? 'secondary' : 'outline'}
                              className={
                                item.completed
                                  ? 'bg-green-100 text-green-800'
                                  : item.scanned
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600'
                              }
                            >
                              {item.completed ? 'Terminé' : item.scanned ? 'En cours' : 'En attente'}
                            </Badge>
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