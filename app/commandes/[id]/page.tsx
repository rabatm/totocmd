'use client';

import AddProduitDialog from '@/components/AddProduitDialogV2';
import ClientName from '@/components/ClientName';
import CommandeStatusSelect from '@/components/CommandeStatusSelect';
import EditProduitDialog from '@/components/EditProduitDialog';
import ProduitActions from '@/components/ProduitActions';
import ProduitStatusSelect from '@/components/ProduitStatusSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCommande } from '@/hooks/useCommandes';
import { CommandeProduit } from '@/src/types';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

interface CommandeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CommandeDetailPage({
  params,
}: CommandeDetailPageProps) {
  const { id } = use(params);
  const { data: commande, isLoading } = useCommande(id);
  const [editingProduit, setEditingProduit] = useState<CommandeProduit | null>(
    null,
  );

  // Fonction pour calculer la progression basée sur les statuts des produits
  const calculateProgression = (produits: CommandeProduit[] | undefined) => {
    if (!produits || produits.length === 0) return 0;

    const statusWeights = {
      scanne: 10,
      en_preparation: 30,
      pret_expedition: 70,
      expedie: 90,
      livre: 100,
    };

    const totalProgress = produits.reduce((sum, produit) => {
      return (
        sum + (statusWeights[produit.statut as keyof typeof statusWeights] || 0)
      );
    }, 0);

    return Math.round(totalProgress / produits.length);
  };

  // Fonction pour calculer le détail des statuts
  const getStatusBreakdown = (produits: CommandeProduit[] | undefined) => {
    if (!produits || produits.length === 0) return {};

    const breakdown = produits.reduce((acc, produit) => {
      acc[produit.statut] = (acc[produit.statut] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return breakdown;
  };

  const calculatedProgression = calculateProgression(
    commande?.commande_produits,
  );
  const statusBreakdown = getStatusBreakdown(commande?.commande_produits);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Commande introuvable
          </h1>
          <p className="text-gray-600 mb-6">
            La commande demandée n&apos;existe pas ou a été supprimée.
          </p>
          <Link href="/commandes">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux commandes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* En-tête avec navigation */}
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
              Commande #{commande.numero_commande}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <CommandeStatusSelect
                commandeId={commande.id}
                currentStatus={commande.etat}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Informations générales */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Informations commande */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date de commande
                  </label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(commande.date_commande)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date limite expédition
                  </label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(commande.date_limite_expedition)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total TTC
                  </label>
                  <div className="text-xl font-bold">
                    {formatCurrency(commande.total_ttc)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Acompte versé
                  </label>
                  <div className="text-lg font-medium">
                    {formatCurrency(commande.acompte_verse)}
                  </div>
                </div>
              </div>

              {commande.total_ht && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total HT
                    </label>
                    <div className="font-medium">
                      {formatCurrency(commande.total_ht)}
                    </div>
                  </div>
                  {commande.total_tva && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        TVA
                      </label>
                      <div className="font-medium">
                        {formatCurrency(commande.total_tva)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-500">
                  Progression
                </label>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculatedProgression}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {calculatedProgression}%
                </span>
              </div>

              {/* Détail des statuts */}
              {commande.commande_produits &&
                commande.commande_produits.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {statusBreakdown.scanne && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          Scannés: {statusBreakdown.scanne}
                        </span>
                      )}
                      {statusBreakdown.en_preparation && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          En préparation: {statusBreakdown.en_preparation}
                        </span>
                      )}
                      {statusBreakdown.pret_expedition && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          Prêts: {statusBreakdown.pret_expedition}
                        </span>
                      )}
                      {statusBreakdown.expedie && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          Expédiés: {statusBreakdown.expedie}
                        </span>
                      )}
                      {statusBreakdown.livre && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          Livrés: {statusBreakdown.livre}
                        </span>
                      )}
                    </div>
                  </div>
                )}

              {commande.mode_reglement && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mode de règlement
                  </label>
                  <div className="mt-1">{commande.mode_reglement}</div>
                </div>
              )}

              {commande.remarque && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Remarques
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    {commande.remarque}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ClientName clientId={commande.client_id} />
            </CardContent>
          </Card>
        </div>

        {/* Liste des produits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Produits ({commande.commande_produits?.length || 0})
              </CardTitle>
              <AddProduitDialog commandeId={commande.id} />
            </div>
          </CardHeader>
          <CardContent>
            {commande.commande_produits &&
            commande.commande_produits.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Code produit</TableHead>
                    <TableHead>N° de série</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date scan</TableHead>
                    <TableHead>Remarques</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commande.commande_produits.map(
                    (produit: CommandeProduit) => (
                      <TableRow key={produit.id}>
                        <TableCell className="font-medium">
                          {produit.nom_produit}
                        </TableCell>
                        <TableCell>{produit.code_produit || '-'}</TableCell>
                        <TableCell>{produit.numero_serie || '-'}</TableCell>
                        <TableCell>{produit.quantite}</TableCell>
                        <TableCell>
                          <ProduitStatusSelect
                            produitId={produit.id}
                            commandeId={commande.id}
                            currentStatus={produit.statut}
                          />
                        </TableCell>
                        <TableCell>
                          {formatDateTime(produit.date_scan)}
                        </TableCell>
                        <TableCell>{produit.remarque || '-'}</TableCell>
                        <TableCell>
                          <ProduitActions
                            produitId={produit.id}
                            commandeId={commande.id}
                            produitName={produit.nom_produit}
                            onEdit={() => setEditingProduit(produit)}
                          />
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun produit dans cette commande
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog d'édition de produit */}
      {editingProduit && (
        <EditProduitDialog
          open={!!editingProduit}
          onOpenChange={open => !open && setEditingProduit(null)}
          produit={editingProduit}
          commandeId={commande.id}
        />
      )}
    </div>
  );
}
