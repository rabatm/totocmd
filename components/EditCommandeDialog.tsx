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
import { useUpdateCommande } from '@/hooks/useCommandeMutations';
import { calculateDateExpeditionPrevisionnelle } from '@/lib/dateUtils';
import { CommandeTypes, CommandeWithDetails, TypeCommande } from '@/src/types';
import { Edit2, Loader2, Save } from 'lucide-react';
import { useState } from 'react';

interface EditCommandeDialogProps {
  commande: CommandeWithDetails;
}

export default function EditCommandeDialog({ commande }: EditCommandeDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type_commande: commande.type_commande || CommandeTypes.NORMALE,
    date_migration: commande.date_migration || '',
    date_limite_expedition: commande.date_limite_expedition || '',
    remarque: commande.remarque || '',
  });

  const updateCommande = useUpdateCommande();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type_commande === CommandeTypes.MIGRATION_OUVERTURE && !formData.date_migration) {
      alert('Veuillez saisir une date de migration pour ce type de commande');
      return;
    }

    try {
      // Calculer la date d'expédition prévisionnelle si c'est une migration
      const dateExpeditionPrevisionnelle =
        formData.type_commande === CommandeTypes.MIGRATION_OUVERTURE && formData.date_migration
          ? calculateDateExpeditionPrevisionnelle(formData.date_migration)
          : undefined;

      // Pour les migrations, utiliser la date d'expédition calculée comme date limite
      const dateLimiteExpedition =
        formData.type_commande === CommandeTypes.MIGRATION_OUVERTURE && dateExpeditionPrevisionnelle
          ? dateExpeditionPrevisionnelle
          : formData.date_limite_expedition || undefined;

      await updateCommande.mutateAsync({
        id: commande.id,
        updates: {
          type_commande: formData.type_commande,
          date_migration: formData.date_migration || undefined,
          date_expedition_previsionnelle: dateExpeditionPrevisionnelle,
          date_limite_expedition: dateLimiteExpedition,
          remarque: formData.remarque || undefined,
        },
      });

      alert('Commande mise à jour avec succès');
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la commande');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la commande</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de commande */}
          <div className="space-y-2">
            <Label htmlFor="type_commande">Type de commande *</Label>
            <select
              id="type_commande"
              value={formData.type_commande}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  type_commande: e.target.value as TypeCommande,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value={CommandeTypes.NORMALE}>📦 Commande normale</option>
              <option value={CommandeTypes.MIGRATION_OUVERTURE}>🔄 Migration/Ouverture</option>
            </select>
          </div>

          {/* Date de migration (seulement pour migration/ouverture) */}
          {formData.type_commande === CommandeTypes.MIGRATION_OUVERTURE && (
            <div className="space-y-2">
              <Label htmlFor="date_migration">Date de migration *</Label>
              <Input
                id="date_migration"
                type="date"
                value={formData.date_migration}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    date_migration: e.target.value,
                  }))
                }
                required={formData.type_commande === CommandeTypes.MIGRATION_OUVERTURE}
              />
              {formData.date_migration && (
                <p className="text-sm text-gray-600">
                  Date d'expédition prévisionnelle: {' '}
                  <span className="font-semibold">
                    {new Date(calculateDateExpeditionPrevisionnelle(formData.date_migration)).toLocaleDateString('fr-FR')}
                  </span>
                  {' '}(2 semaines avant la migration)
                </p>
              )}
            </div>
          )}

          {/* Date limite expédition - calculée automatiquement pour les migrations */}
          {formData.type_commande === CommandeTypes.NORMALE && (
            <div className="space-y-2">
              <Label htmlFor="date_limite_expedition">Date limite expédition</Label>
              <Input
                id="date_limite_expedition"
                type="date"
                value={formData.date_limite_expedition}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    date_limite_expedition: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {/* Remarques */}
          <div className="space-y-2">
            <Label htmlFor="remarque">Remarques</Label>
            <Input
              id="remarque"
              value={formData.remarque}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  remarque: e.target.value,
                }))
              }
              placeholder="Remarques ou instructions particulières..."
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateCommande.isPending}
              className="min-w-24"
            >
              {updateCommande.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}