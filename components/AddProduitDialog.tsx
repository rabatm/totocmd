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
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

interface AddProduitDialogProps {
  commandeId: string;
}

function AddProduitDialog({ commandeId }: AddProduitDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [manualMode, setManualMode] = useState(false);
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

    if (!manualMode && !selectedProduit) {
      alert('Veuillez sélectionner un produit du catalogue');
      return;
    }

    if (manualMode && !formData.nom_produit.trim()) {
      alert('Le nom du produit est obligatoire');
      return;
    }

    try {
      await addProduit.mutateAsync({
        commande_id: commandeId,
        personnel_id: 1,
        nom_produit: manualMode
          ? formData.nom_produit
          : selectedProduit!.libelle,
        code_produit: manualMode
          ? formData.code_produit || undefined
          : selectedProduit!.code || undefined,
        numero_serie: formData.numero_serie || undefined,
        quantite: formData.quantite,
        statut: formData.statut,
        remarque: formData.remarque || undefined,
      });

      // Reset du formulaire
      setSelectedProduit(null);
      setManualMode(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle entre catalogue et saisie manuelle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="text-sm font-medium">
              {manualMode ? 'Saisie manuelle' : 'Sélection depuis le catalogue'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setManualMode(!manualMode);
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
            >
              {manualMode ? 'Utiliser le catalogue' : 'Saisie manuelle'}
            </Button>
          </div>

          {/* Mode catalogue */}
          {!manualMode && (
            <div>
              <Label htmlFor="produit">Produit du catalogue *</Label>
              <ProductSelect
                value={selectedProduit?.id}
                onSelect={produit => setSelectedProduit(produit)}
                placeholder="Sélectionner un produit du catalogue..."
                showStock={true}
                className="mt-1"
              />
              {selectedProduit && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {selectedProduit.libelle}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(selectedProduit.prix)}
                    </span>
                  </div>
                  {selectedProduit.description && (
                    <p className="text-sm text-gray-600">
                      {selectedProduit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {selectedProduit.code && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {selectedProduit.code}
                      </span>
                    )}
                    {selectedProduit.famille_libelle && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {selectedProduit.famille_libelle}
                      </span>
                    )}
                    {selectedProduit.tenue_stock && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        Stock géré
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode saisie manuelle */}
          {manualMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom_produit">Nom du produit *</Label>
                <Input
                  id="nom_produit"
                  value={formData.nom_produit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, nom_produit: e.target.value })
                  }
                  placeholder="Ex: Produit personnalisé"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code_produit">Code produit</Label>
                <Input
                  id="code_produit"
                  value={formData.code_produit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, code_produit: e.target.value })
                  }
                  placeholder="Ex: CUSTOM-001"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero_serie">N° de série</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, numero_serie: e.target.value })
                }
                placeholder="Ex: SN001"
              />
            </div>
            <div>
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                id="quantite"
                type="number"
                min="1"
                value={formData.quantite}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    quantite: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={(value: string) =>
                setFormData({ ...formData, statut: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProduitStatus.SCANNE}>Scanné</SelectItem>
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

          <div>
            <Label htmlFor="remarque">Remarques</Label>
            <Textarea
              id="remarque"
              value={formData.remarque}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, remarque: e.target.value })
              }
              placeholder="Remarques optionnelles..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
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
              Ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddProduitDialog;
