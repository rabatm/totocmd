'use client';

import ClientSelect from '@/components/ClientSelect';
import ImportSourceSelector from '@/components/ImportSourceSelector';
import ExtrabatCommandeList from '@/components/ExtrabatCommandeList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCommande } from '@/hooks/useCommandeMutations';
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Types pour améliorer le typage strict
interface Client {
  id: number;
  name: string;
  extrabat_id?: string;
  // Ajouter d'autres propriétés selon le modèle Client
}

interface FormData {
  client_id: string;
  numero_commande: string;
  date_commande: string;
  date_limite_expedition: string;
  acompte_verse: number;
  total_ttc: number;
  total_ht: number;
  total_tva: number;
  remarque: string;
}

interface ManualOrderFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  createCommande: ReturnType<typeof useCreateCommande>;
  generateNumeroCommande: () => string;
}

export default function CreateCommandePage() {
  const router = useRouter();
  const createCommande = useCreateCommande();

  // État pour le mode de création
  const [importSource, setImportSource] = useState<'manual' | 'extrabat'>('manual');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState<FormData>({
    client_id: '',
    numero_commande: '',
    date_commande: new Date().toISOString().split('T')[0],
    date_limite_expedition: '',
    acompte_verse: 0,
    total_ttc: 0,
    total_ht: 0,
    total_tva: 0,
    remarque: '',
  });

  // Récupérer les détails du client sélectionné
  useEffect(() => {
    const fetchClientDetails = async () => {
      if (formData.client_id) {
        try {
          // Récupérer le client depuis Supabase
          const response = await fetch(`/api/clients/${formData.client_id}`);
          if (response.ok) {
            const client = await response.json();
            setSelectedClient(client);
          } else {
            console.error('Erreur API clients:', response.status);
            setSelectedClient(null);
          }
        } catch (error) {
          console.error('Erreur récupération client:', error);
          setSelectedClient(null);
        }
      } else {
        setSelectedClient(null);
      }
    };

    fetchClientDetails();
  }, [formData.client_id]);

  // Génération automatique du numéro de commande
  const generateNumeroCommande = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);
    return `CMD-${year}-${month}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!formData.client_id) {
      alert('Veuillez sélectionner un client');
      return;
    }

    if (!formData.numero_commande) {
      alert('Veuillez saisir un numéro de commande');
      return;
    }

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
        remarque: formData.remarque || undefined,
      });

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
            <p className="text-gray-600">
              {importSource === 'manual'
                ? 'Créer une nouvelle commande client'
                : 'Importer une commande depuis ExtraBat'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sélection du mode de création */}
        <ImportSourceSelector
          value={importSource}
          onValueChange={setImportSource}
        />

        {/* Sélection du client (toujours nécessaire) */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection du client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="client">Client *</Label>
              <ClientSelect
                value={formData.client_id}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, client_id: value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Affichage conditionnel selon le mode */}
        {importSource === 'extrabat' && selectedClient?.extrabat_id ? (
          <ExtrabatCommandeList
            clientId={formData.client_id}
            clientExtrabatId={selectedClient.extrabat_id}
          />
        ) : importSource === 'extrabat' && formData.client_id ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-orange-600">
                <p>Ce client n&apos;a pas d&apos;ID ExtraBat configuré.</p>
                <p className="text-sm mt-1">
                  Veuillez sélectionner un autre client ou utiliser la création manuelle.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : importSource === 'manual' && formData.client_id ? (
          <ManualOrderForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            createCommande={createCommande}
            generateNumeroCommande={generateNumeroCommande}
          />
        ) : null}
      </div>
    </div>
  );
}

// Composant pour le formulaire manuel
function ManualOrderForm({ formData, setFormData, handleSubmit, createCommande, generateNumeroCommande }: ManualOrderFormProps) {
  return (
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
            {/* Numéro de commande */}
            <div className="space-y-2">
              <Label htmlFor="numero_commande">Numéro de commande *</Label>
              <div className="flex space-x-2">
                <Input
                  id="numero_commande"
                  value={formData.numero_commande}
                  onChange={e =>
                    setFormData((prev) => ({
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
                    setFormData((prev) => ({
                      ...prev,
                      numero_commande: generateNumeroCommande(),
                    }))
                  }
                >
                  Auto
                </Button>
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
                    setFormData((prev) => ({
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
                    setFormData((prev) => ({
                      ...prev,
                      date_limite_expedition: e.target.value,
                    }))
                  }
                />
              </div>
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
                setFormData((prev) => ({ ...prev, remarque: e.target.value }))
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
  );
}