'use client';

import { ProductSelect } from '@/components/ProductSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddProduit } from '@/hooks/useProduitMutations';
import { Produit, ProduitStatus } from '@/src/types';
import { Edit, Loader2, Package, Plus } from 'lucide-react';
import { useState } from 'react';

interface AddProduitDialogProps {
  commandeId: string;
}

function AddProduitDialog({ commandeId }: AddProduitDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [useCatalog, setUseCatalog] = useState(true); // Par défaut en mode catalogue
  const [formData, setFormData] = useState({
    nom_produit: '',
    code_produit: '',
    numero_serie: '',
    quantite: 1,
    statut: ProduitStatus.RESERVE as string,
    remarque: '',
  });

  const addProduit = useAddProduit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useCatalog && !selectedProduit) {
      alert('Veuillez sélectionner un produit du catalogue');
      return;
    }

    if (!useCatalog && !formData.nom_produit.trim()) {
      alert('Le nom du produit est obligatoire');
      return;
    }

    try {
      await addProduit.mutateAsync({
        commande_id: commandeId,
        personnel_id: 1,
        nom_produit: useCatalog
          ? selectedProduit!.libelle
          : formData.nom_produit,
        code_produit: useCatalog
          ? selectedProduit!.code || undefined
          : formData.code_produit || undefined,
        numero_serie: formData.numero_serie || undefined,
        quantite: formData.quantite,
        statut: formData.statut,
        remarque: formData.remarque || undefined,
      });

      // Reset du formulaire
      setSelectedProduit(null);
      setUseCatalog(true);
      setFormData({
        nom_produit: '',
        code_produit: '',
        numero_serie: '',
        quantite: 1,
        statut: ProduitStatus.RESERVE,
        remarque: '',
      });
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      alert("Erreur lors de l'ajout du produit");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter un produit à la commande</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toggle Mode */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="catalog"
                name="mode"
                checked={useCatalog}
                onChange={() => {
                  setUseCatalog(true);
                  setSelectedProduit(null);
                  setFormData({
                    nom_produit: '',
                    code_produit: '',
                    numero_serie: '',
                    quantite: 1,
                    statut: ProduitStatus.RESERVE,
                    remarque: '',
                  });
                }}
                className="h-4 w-4 text-blue-600"
              />
              <label
                htmlFor="catalog"
                className="flex items-center text-sm font-medium"
              >
                <Package className="h-4 w-4 mr-2 text-blue-600" />
                Catalogue Extrabat
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="manual"
                name="mode"
                checked={!useCatalog}
                onChange={() => {
                  setUseCatalog(false);
                  setSelectedProduit(null);
                }}
                className="h-4 w-4 text-gray-600"
              />
              <label
                htmlFor="manual"
                className="flex items-center text-sm font-medium"
              >
                <Edit className="h-4 w-4 mr-2 text-gray-600" />
                Saisie manuelle
              </label>
            </div>
          </div>

          {/* Mode Catalogue */}
          {useCatalog && (
            <div className="space-y-4">
              <div>
                <Label>Sélectionner un produit du catalogue *</Label>
                <ProductSelect
                  value={selectedProduit?.id}
                  onSelect={produit => setSelectedProduit(produit)}
                  placeholder="Rechercher et sélectionner un produit..."
                  showStock={true}
                  className="mt-2"
                />
              </div>

              {selectedProduit && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">
                        {selectedProduit.libelle}
                      </h4>
                      {selectedProduit.description && (
                        <p className="text-sm text-blue-700 mt-1">
                          {selectedProduit.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {selectedProduit.code && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                            Code: {selectedProduit.code}
                          </span>
                        )}
                        {selectedProduit.famille_libelle && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                            {selectedProduit.famille_libelle}
                          </span>
                        )}
                        {selectedProduit.tenue_stock && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                            Stock géré
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-900">
                        {formatPrice(selectedProduit.prix)}
                      </div>
                      <div className="text-xs text-blue-600">Prix unitaire</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode Manuel */}
          {!useCatalog && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom_produit">Nom du produit *</Label>
                <Input
                  id="nom_produit"
                  value={formData.nom_produit}
                  onChange={e =>
                    setFormData({ ...formData, nom_produit: e.target.value })
                  }
                  placeholder="Ex: Produit personnalisé"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="code_produit">Code produit</Label>
                <Input
                  id="code_produit"
                  value={formData.code_produit}
                  onChange={e =>
                    setFormData({ ...formData, code_produit: e.target.value })
                  }
                  placeholder="Ex: CUSTOM-001"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Champs communs */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantite">Quantité *</Label>
              <Input
                id="quantite"
                type="number"
                min="1"
                value={formData.quantite}
                onChange={e =>
                  setFormData({
                    ...formData,
                    quantite: parseInt(e.target.value) || 1,
                  })
                }
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="numero_serie">N° de série</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={e =>
                  setFormData({ ...formData, numero_serie: e.target.value })
                }
                placeholder="Ex: SN001"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={value =>
                  setFormData({ ...formData, statut: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProduitStatus.RESERVE}>Réservé</SelectItem>
                  <SelectItem value={ProduitStatus.EN_PREPARATION}>
                    En préparation
                  </SelectItem>
                  <SelectItem value={ProduitStatus.PRET_EXPEDITION}>
                    Prêt expédition
                  </SelectItem>
                  <SelectItem value={ProduitStatus.EXPEDIE}>Expédié</SelectItem>
                  <SelectItem value={ProduitStatus.LIVRE}>Livré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="remarque">Remarques</Label>
            <Textarea
              id="remarque"
              value={formData.remarque}
              onChange={e =>
                setFormData({ ...formData, remarque: e.target.value })
              }
              placeholder="Remarques optionnelles..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Prix calculé */}
          {useCatalog && selectedProduit && formData.quantite > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Prix total :</span>
                <span className="font-bold text-green-900">
                  {formatPrice(selectedProduit.prix * formData.quantite)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={addProduit.isPending}>
              {addProduit.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Ajouter le produit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddProduitDialog;
