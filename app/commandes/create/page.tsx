'use client';

import ClientSelect from '@/components/ClientSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCommande } from '@/hooks/useCommandeMutations';
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateCommandePage() {
  const router = useRouter();
  const createCommande = useCreateCommande();

  const [formData, setFormData] = useState({
    client_id: '',
    numero_commande: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_limite_expedition: '',
    acompte_verse: 0,
    total_ttc: 0,
    total_ht: 0,
    total_tva: 0,
    mode_reglement: '',
    remarque: '',
  });

  // Génération automatique du numéro de commande
  const generateNumeroCommande = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    return `CMD-${year}-${month}-${timestamp}`;
  };

  // ...existing code...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (!formData.numero_commande) {
      alert('Veuillez saisir un numéro de commande');
      return;
    }

    // ...existing code...

    try {
      const newCommande = await createCommande.mutateAsync({
        client_id: parseInt(formData.client_id),
        numero_commande: formData.numero_commande,
        date_commande: formData.date_commande,
        date_limite_expedition: formData.date_limite_expedition || undefined,
        acompte_verse: formData.acompte_verse,
        total_ttc: formData.total_ttc,
        total_ht: formData.total_ht || undefined,
        total_tva: formData.total_tva || undefined,
        mode_reglement: formData.mode_reglement || undefined,
        remarque: formData.remarque || undefined,
      });

      // Rediriger vers la page de détail de la nouvelle commande
      router.push(`/commandes/${newCommande.id}`);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la commande');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/commandes">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nouvelle commande
            </h1>
            <p className="text-gray-600">Créer une nouvelle commande client</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Sélection client */}
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <ClientSelect
                    value={formData.client_id}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, client_id: value }))
                    }
                  />
                </div>

                {/* Numéro de commande */}
                <div className="space-y-2">
                  <Label htmlFor="numero_commande">Numéro de commande *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="numero_commande"
                      value={formData.numero_commande}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          numero_commande: e.target.value,
                        }))
                      }
                      placeholder="CMD-2025-001"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          numero_commande: generateNumeroCommande(),
                        }))
                      }
                    >
                      Auto
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Date de commande */}
                <div className="space-y-2">
                  <Label htmlFor="date_commande">Date de commande *</Label>
                  <Input
                    id="date_commande"
                    type="date"
                    value={formData.date_commande}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        date_commande: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Date limite expédition */}
                <div className="space-y-2">
                  <Label htmlFor="date_limite_expedition">
                    Date limite expédition
                  </Label>
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
              </div>

              {/* Mode de règlement */}
              <div className="space-y-2">
                <Label htmlFor="mode_reglement">Mode de règlement</Label>
                <Input
                  id="mode_reglement"
                  value={formData.mode_reglement}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      mode_reglement: e.target.value,
                    }))
                  }
                  placeholder="Virement, Chèque, Espèces..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Remarques */}
          <Card>
            <CardHeader>
              <CardTitle>Remarques</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.remarque}
                onChange={e =>
                  setFormData(prev => ({ ...prev, remarque: e.target.value }))
                }
                placeholder="Remarques ou instructions particulières..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <Link href="/commandes">
              <Button variant="outline">Annuler</Button>
            </Link>
            <Button
              type="submit"
              disabled={createCommande.isPending}
              className="min-w-32"
            >
              {createCommande.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer la commande
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
