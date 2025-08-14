'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useFamilles,
  useProduits,
  useProduitsStats,
} from '@/hooks/useProduits';
import {
  useArchiveProduitsMutation,
  useDeleteProduitMutation,
  useSyncProduitsMutation,
} from '@/hooks/useProduitsMutations';
import { Produit } from '@/src/types';
import {
  AlertTriangle,
  Archive,
  Boxes,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { useState } from 'react';

export default function ProduitsPage() {
  const [search, setSearch] = useState('');
  const [selectedFamilleId, setSelectedFamilleId] = useState<
    number | undefined
  >();
  const [tenueStockFilter, setTenueStockFilter] = useState<
    boolean | undefined
  >();
  const [showArchived, setShowArchived] = useState(false);

  // Queries
  const { data: produits = [], isLoading } = useProduits({
    search: search || undefined,
    familleId: selectedFamilleId,
    tenueStock: tenueStockFilter,
  });

  const { data: familles = [] } = useFamilles();
  const { data: stats } = useProduitsStats();

  // Mutations
  const syncMutation = useSyncProduitsMutation();
  const deleteMutation = useDeleteProduitMutation();
  const archiveMutation = useArchiveProduitsMutation();

  const filteredProduits = produits.filter(p =>
    showArchived ? p.archived : !p.archived,
  );

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      // Optionnel: afficher une notification de succès
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      // Optionnel: afficher une notification d'erreur
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erreur de suppression:', error);
      }
    }
  };

  const handleArchive = async (id: number, archived: boolean) => {
    try {
      await archiveMutation.mutateAsync({ ids: [id], archived });
    } catch (error) {
      console.error("Erreur d'archivage:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getStockBadge = (produit: Produit) => {
    if (!produit.tenue_stock) {
      return <Badge variant="secondary">Hors stock</Badge>;
    }

    if (produit.stock_physique <= 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    }

    if (produit.stock_physique <= (produit.stock_mini || 0)) {
      return (
        <Badge variant="secondary" className="bg-orange-500 text-white">
          Stock faible
        </Badge>
      );
    }

    return <Badge variant="default">{produit.stock_physique}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits et synchronisez avec Extrabat
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={syncMutation.isPending}
            variant="outline"
          >
            {syncMutation.isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Synchroniser
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total produits
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En stock</CardTitle>
              <Boxes className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.enStock}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hors stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.horsStock}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prix moyen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats.prixMoyen)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par code, libellé ou description..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedFamilleId?.toString() || 'all'}
              onValueChange={value =>
                setSelectedFamilleId(
                  value === 'all' ? undefined : parseInt(value),
                )
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Toutes les familles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les familles</SelectItem>
                {familles.map(famille => (
                  <SelectItem key={famille.id} value={famille.id.toString()}>
                    {famille.libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={tenueStockFilter?.toString() || 'all'}
              onValueChange={value =>
                setTenueStockFilter(
                  value === 'true'
                    ? true
                    : value === 'false'
                    ? false
                    : undefined,
                )
              }
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="true">En stock</SelectItem>
                <SelectItem value="false">Hors stock</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showArchived ? 'default' : 'outline'}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="mr-2 h-4 w-4" />
              {showArchived ? 'Masquer archivés' : 'Voir archivés'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des produits</CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredProduits.length} produit(s) affiché(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Famille</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProduits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>Aucun produit trouvé</p>
                      <p className="text-sm">
                        Essayez de modifier vos filtres ou synchronisez avec
                        Extrabat
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProduits.map(produit => (
                  <TableRow key={produit.id}>
                    <TableCell className="font-medium">
                      {produit.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{produit.libelle}</div>
                        {produit.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {produit.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {produit.famille_libelle && (
                        <Badge variant="outline">
                          {produit.famille_libelle}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatPrice(produit.prix)}</TableCell>
                    <TableCell>{getStockBadge(produit)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {produit.archived && (
                          <Badge variant="secondary">Archivé</Badge>
                        )}
                        {produit.is_manuel && (
                          <Badge variant="outline">Manuel</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleArchive(produit.id, !produit.archived)
                            }
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            {produit.archived ? 'Désarchiver' : 'Archiver'}
                          </DropdownMenuItem>
                          {produit.is_manuel && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(produit.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
