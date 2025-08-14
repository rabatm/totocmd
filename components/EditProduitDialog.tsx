'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateProduit } from '@/hooks/useProduitMutations';
import { CommandeProduit } from '@/src/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditProduitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produit: CommandeProduit;
  commandeId: string;
}

export default function EditProduitDialog({
  open,
  onOpenChange,
  produit,
  commandeId,
}: EditProduitDialogProps) {
  const [formData, setFormData] = useState({
    nom_produit: '',
    code_produit: '',
    numero_serie: '',
    quantite: 1,
    remarque: '',
  });

  const updateProduit = useUpdateProduit();

  // Initialiser le formulaire avec les données du produit
  useEffect(() => {
    if (produit) {
      setFormData({
        nom_produit: produit.nom_produit,
        code_produit: produit.code_produit || '',
        numero_serie: produit.numero_serie || '',
        quantite: produit.quantite,
        remarque: produit.remarque || '',
      });
    }
  }, [produit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom_produit.trim()) {
      alert('Le nom du produit est obligatoire');
      return;
    }

    try {
      await updateProduit.mutateAsync({
        id: produit.id,
        commande_id: commandeId,
        updates: {
          nom_produit: formData.nom_produit,
          code_produit: formData.code_produit || undefined,
          numero_serie: formData.numero_serie || undefined,
          quantite: formData.quantite,
          remarque: formData.remarque || undefined,
        },
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification du produit');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom_produit">Nom du produit *</Label>
              <Input
                id="nom_produit"
                value={formData.nom_produit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, nom_produit: e.target.value })
                }
                placeholder="Ex: Produit A"
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
                placeholder="Ex: PRD-001"
              />
            </div>
          </div>

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
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateProduit.isPending}>
              {updateProduit.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Sauvegarder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
