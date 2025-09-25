'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateMouvementStock, useProduits } from '@/hooks/useStock';
import { ArrowLeft, Loader2, Package, Save, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryData, setInventoryData] = useState<Record<number, string>>({});

  const { data: produits = [], isLoading: produitsLoading } = useProduits();
  const createMouvement = useCreateMouvementStock();

  // Filtrer les produits selon la recherche
  const filteredProduits = useMemo(() => {
    return produits.filter(produit =>
      produit.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produits, searchTerm]);

  const isLoading = createMouvement.isPending;

  const handleQuantityChange = (produitId: number, quantity: string) => {
    setInventoryData(prev => ({
      ...prev,
      [produitId]: quantity
    }));
  };

  const handleRemoveProduct = (produitId: number) => {
    setInventoryData(prev => {
      const newData = { ...prev };
      delete newData[produitId];
      return newData;
    });
  };

  const getModifiedProducts = () => {
    return filteredProduits.filter(produit => {
      const newQuantity = inventoryData[produit.id];
      return newQuantity !== undefined && newQuantity !== '';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const modifiedProducts = getModifiedProducts();

    if (modifiedProducts.length === 0) {
      alert('Aucune modification à enregistrer');
      return;
    }

    // Validation des quantités
    for (const produit of modifiedProducts) {
      const newQuantity = inventoryData[produit.id];
      const quantity = parseInt(newQuantity);

      if (isNaN(quantity) || quantity < 0) {
        alert(`Quantité invalide pour ${produit.libelle}: ${newQuantity}`);
        return;
      }
    }

    try {
      // Traiter chaque produit modifié
      for (const produit of modifiedProducts) {
        const newQuantity = parseInt(inventoryData[produit.id]);

        await createMouvement.mutateAsync({
          produit_id: produit.id,
          type_mouvement: 'inventaire',
          quantite_mouvement: newQuantity,
          remarques: `Inventaire rapide - Stock corrigé de ${produit.stock_physique || 0} à ${newQuantity}`,
        });
      }

      alert(`Inventaire terminé ! ${modifiedProducts.length} produit(s) mis à jour.`);

      // Reset du formulaire
      setInventoryData({});
      setSearchTerm('');
    } catch (error) {
      console.error('Erreur lors de l\'inventaire:', error);
      alert('Erreur lors de l\'inventaire');
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        {/* En-tête avec navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/stocks">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux stocks
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Inventaire Rapide
                </h1>
                <p className="text-gray-600">
                  Mettez à jour les stocks de plusieurs produits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé des modifications */}
        {getModifiedProducts().length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    <strong>{getModifiedProducts().length} produit(s)</strong> à mettre à jour
                  </span>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer tout
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barre de recherche */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rechercher des produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom ou code produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {filteredProduits.length} produit(s) trouvé(s)
            </p>
          </CardContent>
        </Card>

        {/* Liste des produits */}
        <Card>
          <CardHeader>
            <CardTitle>Produits à inventorier</CardTitle>
          </CardHeader>
          <CardContent>
            {produitsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span className="text-lg">Chargement des produits...</span>
              </div>
            ) : filteredProduits.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProduits.map((produit) => {
                  const currentQuantity = produit.stock_physique || 0;
                  const newQuantity = inventoryData[produit.id];
                  const hasChange = newQuantity !== undefined && newQuantity !== '';

                  return (
                    <div
                      key={produit.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        hasChange ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Informations produit */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-800 font-semibold rounded-lg">
                                {produit.code.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {produit.libelle}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Code: <span className="font-mono">{produit.code}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stock actuel */}
                        <div className="text-center min-w-[100px]">
                          <Label className="text-xs text-gray-500 block">Stock actuel</Label>
                          <span className="text-lg font-bold text-gray-900">{currentQuantity}</span>
                        </div>

                        {/* Saisie nouveau stock */}
                        <div className="min-w-[150px]">
                          <Label htmlFor={`qty-${produit.id}`} className="text-sm font-medium">
                            Nouveau stock
                          </Label>
                          <Input
                            id={`qty-${produit.id}`}
                            type="number"
                            min="0"
                            value={newQuantity || ''}
                            onChange={(e) => handleQuantityChange(produit.id, e.target.value)}
                            placeholder={currentQuantity.toString()}
                            className={`mt-1 ${hasChange ? 'border-blue-500 focus:border-blue-600' : ''}`}
                          />
                        </div>

                        {/* Actions */}
                        {hasChange && (
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(produit.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Différence */}
                      {hasChange && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700">
                              Différence: <span className="font-medium">
                                {parseInt(newQuantity) - currentQuantity > 0 ? '+' : ''}
                                {parseInt(newQuantity) - currentQuantity}
                              </span>
                            </span>
                            <span className="text-blue-600 font-medium">
                              Nouveau total: {newQuantity}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bouton d'action flottant pour mobile */}
        {getModifiedProducts().length > 0 && (
          <div className="fixed bottom-6 right-6 md:hidden">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Enregistrer ({getModifiedProducts().length})
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}