'use client';

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
import { useCreateMouvementStock, useProduitByCode } from '@/hooks/useStock';
import { MouvementStockTypes, Produit, TypeMouvementStock } from '@/src/types';
import { Loader2, Package, Plus, Save } from 'lucide-react';
import { useState } from 'react';

interface StockEntryDialogProps {
  produit?: Produit;
  trigger?: React.ReactNode;
}

export default function StockEntryDialog({ produit, trigger }: StockEntryDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<{
    produit_code: string;
    type_mouvement: TypeMouvementStock;
    quantite: string;
    prix_unitaire: string;
    fournisseur: string;
    numero_facture: string;
    date_entree: string;
    remarques: string;
  }>({
    produit_code: produit?.code || '',
    type_mouvement: MouvementStockTypes.RECEPTION,
    quantite: '',
    prix_unitaire: produit?.prix?.toString() || '',
    fournisseur: '',
    numero_facture: '',
    date_entree: '',
    remarques: '',
  });

  const createMouvement = useCreateMouvementStock();
  const { data: produitByCode } = useProduitByCode(formData.produit_code);

  // Utiliser le produit passé en prop ou celui trouvé par code
  const currentProduit = produit || produitByCode;

  const isLoading = createMouvement.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentProduit) {
      alert('Produit non trouvé');
      return;
    }

    if (!formData.quantite && formData.quantite !== '0') {
      alert('Veuillez saisir une quantité');
      return;
    }

    const quantite = parseInt(formData.quantite);
    if (isNaN(quantite) || (formData.type_mouvement === 'reception' && quantite <= 0) || (formData.type_mouvement === 'inventaire' && quantite < 0)) {
      alert(formData.type_mouvement === 'inventaire' ? 'La quantité doit être supérieure ou égale à 0 pour un inventaire' : 'La quantité doit être supérieure à 0 pour une réception');
      return;
    }

    try {
      const prixUnitaire = formData.prix_unitaire ? parseFloat(formData.prix_unitaire) : undefined;

      await createMouvement.mutateAsync({
        produit_id: currentProduit.id,
        type_mouvement: formData.type_mouvement,
        quantite_mouvement: quantite,
        prix_unitaire: prixUnitaire,
        fournisseur: formData.fournisseur || undefined,
        numero_facture: formData.numero_facture || undefined,
        date_entree: formData.date_entree || undefined,
        remarques: formData.remarques || undefined,
      });

      const typeLabel = formData.type_mouvement === MouvementStockTypes.INVENTAIRE ? 'Inventaire' : 'Réception';
      alert(`${typeLabel} réussi pour ${currentProduit.libelle}`);

      // Reset du formulaire
      setFormData({
        produit_code: produit?.code || '',
        type_mouvement: MouvementStockTypes.RECEPTION,
        quantite: '',
        prix_unitaire: produit?.prix?.toString() || '',
        fournisseur: '',
        numero_facture: '',
        date_entree: '',
        remarques: '',
      });

      setOpen(false);
    } catch (error) {
      console.error('Erreur lors du mouvement de stock:', error);
      alert('Erreur lors du mouvement de stock');
    }
  };

  const defaultTrigger = (
    <Button
      variant={produit ? "outline" : "default"}
      size={produit ? "sm" : "default"}
      className={produit ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "bg-green-600 hover:bg-green-700"}
    >
      <Plus className="h-4 w-4 mr-2" />
      {produit ? "Entrée" : "Entrée de Stock"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            {formData.type_mouvement === 'inventaire' ? 'Inventaire de Stock' : 'Entrée de Stock'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code produit */}
          <div className="space-y-2">
            <Label htmlFor="produit_code">Code produit *</Label>
            <Input
              id="produit_code"
              value={formData.produit_code}
              onChange={(e) => setFormData(prev => ({ ...prev, produit_code: e.target.value }))}
              placeholder="ABC123"
              required
              disabled={!!produit} // Désactivé si le produit est pré-sélectionné
            />
            {produit && (
              <p className="text-sm text-gray-600">
                <strong>{produit.libelle}</strong>
                <br />
                Stock actuel : <span className="font-medium">{produit.stock_physique || 0}</span>
              </p>
            )}
          </div>

          {/* Type de mouvement */}
          <div className="space-y-2">
            <Label htmlFor="type_mouvement">Type de mouvement *</Label>
            <Select
              value={formData.type_mouvement}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type_mouvement: value as TypeMouvementStock }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MouvementStockTypes.RECEPTION}>Réception</SelectItem>
                <SelectItem value={MouvementStockTypes.INVENTAIRE}>Inventaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantité */}
          <div className="space-y-2">
            <Label htmlFor="quantite">
              {formData.type_mouvement === 'inventaire' ? 'Quantité en stock *' : 'Quantité à ajouter *'}
            </Label>
            <Input
              id="quantite"
              type="number"
              min={formData.type_mouvement === 'inventaire' ? "0" : "1"}
              value={formData.quantite}
              onChange={(e) => setFormData(prev => ({ ...prev, quantite: e.target.value }))}
              placeholder={formData.type_mouvement === 'inventaire' ? "0" : "10"}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.type_mouvement === 'inventaire'
                ? 'Entrez la quantité réelle en stock (peut être 0)'
                : 'Quantité reçue du fournisseur (doit être > 0)'}
            </p>
          </div>

          {/* Prix unitaire */}
          <div className="space-y-2">
            <Label htmlFor="prix_unitaire">Prix unitaire (€)</Label>
            <Input
              id="prix_unitaire"
              type="number"
              step="0.01"
              min="0"
              value={formData.prix_unitaire}
              onChange={(e) => setFormData(prev => ({ ...prev, prix_unitaire: e.target.value }))}
              placeholder="25.99"
            />
          </div>

          {/* Fournisseur */}
          <div className="space-y-2">
            <Label htmlFor="fournisseur">Fournisseur</Label>
            <Input
              id="fournisseur"
              value={formData.fournisseur}
              onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
              placeholder="Nom du fournisseur"
            />
          </div>

          {/* Numéro de facture */}
          <div className="space-y-2">
            <Label htmlFor="numero_facture">N° de facture</Label>
            <Input
              id="numero_facture"
              value={formData.numero_facture}
              onChange={(e) => setFormData(prev => ({ ...prev, numero_facture: e.target.value }))}
              placeholder="FAC-2024-001"
            />
          </div>

          {/* Date d'entrée */}
          <div className="space-y-2">
            <Label htmlFor="date_entree">Date d&apos;entrée</Label>
            <Input
              id="date_entree"
              type="date"
              value={formData.date_entree}
              onChange={(e) => setFormData(prev => ({ ...prev, date_entree: e.target.value }))}
            />
          </div>

          {/* Remarques */}
          <div className="space-y-2">
            <Label htmlFor="remarques">Remarques</Label>
            <Textarea
              id="remarques"
              value={formData.remarques}
              onChange={(e) => setFormData(prev => ({ ...prev, remarques: e.target.value }))}
              placeholder="Notes ou observations..."
              rows={3}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-32 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}