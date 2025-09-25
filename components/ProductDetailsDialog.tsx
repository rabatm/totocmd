'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMouvementsStock } from '@/hooks/useStock';
import { Produit, MouvementStock } from '@/src/types';
import {
  Calendar,
  DollarSign,
  Eye,
  Package,
  TrendingDown,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';

interface ProductDetailsDialogProps {
  produit: Produit;
  trigger?: React.ReactNode;
  standalone?: boolean; // Nouveau prop pour indiquer si c'est utilisé de manière autonome
}

export default function ProductDetailsDialog({
  produit,
  trigger,
  standalone = false,
}: ProductDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: mouvements = [], isLoading } = useMouvementsStock(produit.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStockStatus = () => {
    if (!produit.tenue_stock) return { label: 'Hors stock', variant: 'secondary' as const };

    const stock = produit.stock_physique || 0;
    if (produit.stock_mini && stock <= produit.stock_mini) {
      return { label: 'Stock faible', variant: 'destructive' as const };
    }
    if (produit.stock_maxi && stock >= produit.stock_maxi) {
      return { label: 'Stock élevé', variant: 'default' as const };
    }
    return { label: 'Stock normal', variant: 'default' as const };
  };

  const stockStatus = getStockStatus();

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Eye className="h-4 w-4 mr-2" />
      Voir
    </Button>
  );

  // Si utilisé en standalone, ne pas wrapper dans un Dialog
  if (standalone) {
    return <ProductContent produit={produit} mouvements={mouvements} isLoading={isLoading} formatPrice={formatPrice} formatDate={formatDate} stockStatus={stockStatus} />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Détails du produit: {produit.libelle}
          </DialogTitle>
        </DialogHeader>
        <ProductContent produit={produit} mouvements={mouvements} isLoading={isLoading} formatPrice={formatPrice} formatDate={formatDate} stockStatus={stockStatus} />
      </DialogContent>
    </Dialog>
  );
}

// Composant séparé pour le contenu du produit
function ProductContent({ produit, mouvements, isLoading, formatPrice, formatDate, stockStatus }: {
  produit: Produit;
  mouvements: MouvementStock[];
  isLoading: boolean;
  formatPrice: (price: number) => string;
  formatDate: (dateString: string) => string;
  stockStatus: { label: string; variant: "default" | "destructive" | "outline" | "secondary" };
}) {
  return (
    <div className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Informations générales
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Code:</span>
                  <span className="font-mono">{produit.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Libellé:</span>
                  <span>{produit.libelle}</span>
                </div>
                {produit.description && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <span className="text-right max-w-[200px]">{produit.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Prix:</span>
                  <span className="font-semibold text-green-600">{formatPrice(produit.prix)}</span>
                </div>
                {produit.prix_mini && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Prix mini:</span>
                    <span>{formatPrice(produit.prix_mini)}</span>
                  </div>
                )}
                {produit.prix_conseille && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Prix conseillé:</span>
                    <span>{formatPrice(produit.prix_conseille)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">TVA:</span>
                  <span>{produit.taux_tva}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Famille:</span>
                  <span>{produit.famille_libelle || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Sous-famille:</span>
                  <span>{produit.sous_famille_libelle || '-'}</span>
                </div>
                {produit.emplacement && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Emplacement:</span>
                    <span>{produit.emplacement}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Commissionnable:</span>
                  <Badge variant={produit.commissionable ? 'default' : 'secondary'}>
                    {produit.commissionable ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Archivé:</span>
                  <Badge variant={produit.archived ? 'destructive' : 'secondary'}>
                    {produit.archived ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Manuel:</span>
                  <Badge variant={produit.is_manuel ? 'default' : 'secondary'}>
                    {produit.is_manuel ? 'Oui' : 'Non'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Informations de stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Warehouse className="h-4 w-4" />
                Gestion des stocks
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Gestion du stock:</span>
                  <Badge variant={produit.tenue_stock ? 'default' : 'secondary'}>
                    {produit.tenue_stock ? 'Activée' : 'Désactivée'}
                  </Badge>
                </div>
                {produit.tenue_stock && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Stock actuel:</span>
                      <span className="font-bold text-lg">{produit.stock_physique || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Statut stock:</span>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </div>
                    {produit.stock_mini && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Stock minimum:</span>
                        <span className={produit.stock_physique <= produit.stock_mini ? 'text-red-600 font-semibold' : ''}>
                          {produit.stock_mini}
                        </span>
                      </div>
                    )}
                    {produit.stock_maxi && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Stock maximum:</span>
                        <span className={produit.stock_physique >= produit.stock_maxi ? 'text-orange-600 font-semibold' : ''}>
                          {produit.stock_maxi}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Dernière sync:</span>
                  <span className="text-xs">{formatDate(produit.last_sync)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques des mouvements */}
          {produit.tenue_stock && mouvements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Statistiques des mouvements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total mouvements</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{mouvements.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Réceptions</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {mouvements.filter(m => m.type_mouvement === 'reception').length}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Inventaires</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {mouvements.filter(m => m.type_mouvement === 'inventaire').length}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Valeur stock</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice((produit.stock_physique || 0) * produit.prix)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historique des mouvements de stock */}
          {produit.tenue_stock && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Historique des mouvements de stock
              </h3>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Chargement de l&apos;historique...</span>
                  </div>
                </div>
              ) : mouvements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Aucun mouvement de stock enregistré</p>
                  <p className="text-sm">Les mouvements apparaîtront ici après les premières entrées ou inventaires</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantité avant</TableHead>
                        <TableHead>Quantité mouvement</TableHead>
                        <TableHead>Quantité après</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>N° Facture</TableHead>
                        <TableHead>Remarques</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mouvements.map(mouvement => (
                        <TableRow key={mouvement.id}>
                          <TableCell className="font-medium">
                            {formatDate(mouvement.created_at!)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={mouvement.type_mouvement === 'reception' ? 'default' : 'secondary'}
                            >
                              {mouvement.type_mouvement === 'reception' ? 'Réception' : 'Inventaire'}
                            </Badge>
                          </TableCell>
                          <TableCell>{mouvement.quantite_avant ?? '-'}</TableCell>
                          <TableCell>
                            <span className={mouvement.quantite_mouvement > 0 ? 'text-green-600' : 'text-red-600'}>
                              {mouvement.quantite_mouvement > 0 ? '+' : ''}{mouvement.quantite_mouvement}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">{mouvement.quantite_apres}</TableCell>
                          <TableCell>
                            {mouvement.prix_unitaire ? formatPrice(mouvement.prix_unitaire) : '-'}
                          </TableCell>
                          <TableCell>{mouvement.fournisseur || '-'}</TableCell>
                          <TableCell>{mouvement.numero_facture || '-'}</TableCell>
                          <TableCell className="max-w-[150px] truncate">
                            {mouvement.remarques || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }