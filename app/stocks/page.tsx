'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ProductDetailsDialog from '@/components/ProductDetailsDialog';
import StockEntryDialog from '@/components/StockEntryDialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProduits, useStockReserve, useStockEnCommande } from '@/hooks/useStock';
import { Produit } from '@/src/types';
import { Loader2, Package, Search, Eye, AlertTriangle, MoreHorizontal, XCircle, AlertCircle, CheckCircle, Lock, ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function StocksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);

  // Récupérer les vraies données depuis Supabase
  const { data: produits, isLoading, error } = useProduits();
  const { data: stockReserve = {} } = useStockReserve();
  const { data: stockEnCommande = {} } = useStockEnCommande();

  // Gestion des états de chargement et d'erreur
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des produits...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des produits:</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const filteredProduits = (produits || []).filter(produit => {
    const matchSearch = produit.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       produit.code.toLowerCase().includes(searchTerm.toLowerCase());

    const stockPhysique = produit.stock_physique || 0;
    const stockReserveQty = stockReserve[produit.code] || 0;
    const stockDisponible = stockPhysique - stockReserveQty;
    const stockMini = produit.stock_mini || 0;

    const matchFilter = stockFilter === 'all' ||
                       (stockFilter === 'low' && stockDisponible <= stockMini) ||
                       (stockFilter === 'normal' && stockDisponible > stockMini);

    return matchSearch && matchFilter;
  });


  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <Card className="shadow-xl bg-gradient-to-br from-blue-50 via-white to-orange-50 rounded-2xl border-0">
          <CardHeader className="sticky top-0 z-10 bg-gradient-to-r from-blue-100 via-white to-orange-100 rounded-t-2xl shadow-md">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-2xl font-extrabold text-blue-900">
                  Gestion des Stocks{' '}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-base ml-2">
                    {filteredProduits.length}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Link href="/inventory">
                    <Button className="bg-blue-600 hover:bg-blue-700 font-semibold">
                      <Package className="h-4 w-4 mr-2" />
                      Inventaire Rapide
                    </Button>
                  </Link>
                  <StockEntryDialog />
                </div>
              </div>

              {/* Filtres et recherche intégrés */}
              <div className="flex gap-2 items-center flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par code ou nom..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border-2 border-blue-200 rounded-lg px-10 py-2 text-sm focus:border-blue-400 focus:outline-none shadow"
                  />
                </div>
                <select
                  value={stockFilter}
                  onChange={e => setStockFilter(e.target.value)}
                  className="border-2 border-orange-200 rounded-lg px-3 py-2 text-sm focus:border-orange-400 focus:outline-none shadow"
                >
                  <option value="all">TOUS LES STOCKS</option>
                  <option value="low">STOCK FAIBLE</option>
                  <option value="normal">STOCK NORMAL</option>
                </select>
              </div>
            </div>
          </CardHeader>

          {/* Statistiques rapides intégrées */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 mb-4">
            <div className="bg-white/60 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Produits</p>
                  <p className="text-lg font-bold text-blue-900">{produits?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Stock réservé</p>
                  <p className="text-lg font-bold text-orange-900">
                    {Object.values(stockReserve || {}).reduce((sum: number, qty: number) => sum + qty, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">En commande</p>
                  <p className="text-lg font-bold text-purple-900">
                    {Object.values(stockEnCommande || {}).reduce((sum: number, qty: number) => sum + qty, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Stock faible</p>
                  <p className="text-lg font-bold text-yellow-900">
                    {(produits || []).filter(p => {
                      const stockPhysique = p.stock_physique || 0;
                      const stockReserveQty = stockReserve[p.code] || 0;
                      const stockDisponible = Math.max(0, stockPhysique - stockReserveQty);
                      return stockDisponible < (p.stock_mini || 0);
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs font-medium text-gray-600">Disponible</p>
                  <p className="text-lg font-bold text-green-900">
                    {(produits || []).reduce((sum, p) => {
                      const stockPhysique = p.stock_physique || 0;
                      const stockReserveQty = stockReserve[p.code] || 0;
                      return sum + Math.max(0, stockPhysique - stockReserveQty);
                    }, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <CardContent>
            <Table className="rounded-xl overflow-hidden">
              <TableHeader className="bg-blue-100">
                <TableRow>
                  <TableHead className="text-blue-900 font-bold">Code</TableHead>
                  <TableHead className="text-blue-900 font-bold">Produit</TableHead>
                  <TableHead className="text-blue-900 font-bold text-center">Stock Physique</TableHead>
                  <TableHead className="text-blue-900 font-bold text-center">Réservé</TableHead>
                  <TableHead className="text-blue-900 font-bold text-center">En Commande</TableHead>
                  <TableHead className="text-blue-900 font-bold text-center">Disponible</TableHead>
                  <TableHead className="text-blue-900 font-bold text-center">Statut</TableHead>
                  <TableHead className="text-blue-900 font-bold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProduits.map((produit) => {
                  const stockPhysique = produit.stock_physique || 0;
                  const stockReserveQty = stockReserve[produit.code] || 0;
                  const stockEnCommandeQty = stockEnCommande[produit.code] || 0;
                  const stockDisponible = stockPhysique - stockReserveQty;
                  const stockMini = produit.stock_mini || 0;
                  const isLowStock = stockDisponible <= stockMini;

                  return (
                    <TableRow
                      key={produit.id}
                      className="hover:bg-orange-100 cursor-pointer transition-all duration-200"
                      onClick={() => setSelectedProduit(produit)}
                    >
                      <TableCell className="font-semibold text-blue-900">{produit.code}</TableCell>
                      <TableCell className="text-gray-700">{produit.libelle}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-gray-900">{stockPhysique}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-orange-600 font-medium">{stockReserveQty}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-purple-600 font-medium">{stockEnCommandeQty}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${
                          stockDisponible < 0 ? 'text-red-600' :
                          isLowStock ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {stockDisponible}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {stockDisponible < 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Négatif
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Faible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            OK
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-orange-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduit(produit);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <div onClick={(e) => e.stopPropagation()}>
                                <StockEntryDialog
                                  produit={produit}
                                  trigger={
                                    <div className="flex items-center w-full">
                                      <Package className="h-4 w-4 mr-2" />
                                      Entrée de stock
                                    </div>
                                  }
                                />
                              </div>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog pour les détails du produit */}
        {selectedProduit && (
          <Dialog open={!!selectedProduit} onOpenChange={() => setSelectedProduit(null)}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Fiche produit - {selectedProduit.code}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <ProductDetailsDialog produit={selectedProduit} standalone={true} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  );
}