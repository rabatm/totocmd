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
import { useAddProduit } from '@/hooks/useProduitMutations';
import { ProduitStatus } from '@/src/types';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';

interface AddProduitDialogFixedProps {
  commandeId: string;
}

function AddProduitDialogFixed({ commandeId }: AddProduitDialogFixedProps) {
  const [open, setOpen] = useState(false);
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

    if (!formData.nom_produit.trim()) {
      alert('Le nom du produit est obligatoire');
      return;
    }

    try {
      await addProduit.mutateAsync({
        commande_id: commandeId,
        personnel_id: 1,
        nom_produit: formData.nom_produit,
        code_produit: formData.code_produit || undefined,
        numero_serie: formData.numero_serie || undefined,
        quantite: formData.quantite,
        statut: formData.statut,
        remarque: formData.remarque || undefined,
      });

      // Reset form and close dialog
      setFormData({
        nom_produit: '',
        code_produit: '',
        numero_serie: '',
        quantite: 1,
        statut: ProduitStatus.RESERVE as string,
        remarque: '',
      });
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      alert("Erreur lors de l'ajout du produit");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un produit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="nom_produit">Nom du produit *</Label>
            <Input
              id="nom_produit"
              value={formData.nom_produit}
              onChange={e =>
                setFormData({ ...formData, nom_produit: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code_produit">Code produit</Label>
            <Input
              id="code_produit"
              value={formData.code_produit}
              onChange={e =>
                setFormData({ ...formData, code_produit: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="numero_serie">Numéro de série</Label>
            <Input
              id="numero_serie"
              value={formData.numero_serie}
              onChange={e =>
                setFormData({ ...formData, numero_serie: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantite">Quantité</Label>
            <Input
              id="quantite"
              type="number"
              min="1"
              value={formData.quantite}
              onChange={e =>
                setFormData({ ...formData, quantite: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="statut">Statut</Label>
            <Select
              value={formData.statut}
              onValueChange={value =>
                setFormData({ ...formData, statut: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
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

          <div className="grid gap-2">
            <Label htmlFor="remarque">Remarque</Label>
            <Textarea
              id="remarque"
              value={formData.remarque}
              onChange={e =>
                setFormData({ ...formData, remarque: e.target.value })
              }
              placeholder="Remarque optionnelle..."
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

export default AddProduitDialogFixed;
