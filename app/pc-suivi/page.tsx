'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { usePCTracking } from '@/hooks/usePCTracking';
import {
  Calendar,
  Download,
  Filter,
  Loader2,
  Monitor,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function PCSuiviPage() {
  const [filters, setFilters] = useState({
    pcType: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    search: '',
  });

  const { data: pcData, isLoading, error, refetch } = usePCTracking(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportToCSV = () => {
    if (!pcData?.length) return;

    const headers = ['Type PC', 'Numéro de Série', 'Commande', 'Client', 'Statut', 'Date Préparation', 'Date Scan'];
    const csvContent = [
      headers.join(','),
      ...pcData.map(pc => [
        pc.pcType,
        pc.numeroSerie || '',
        pc.numeroCommande,
        pc.clientName,
        pc.statut,
        pc.datePreparation || '',
        pc.dateScan || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pc-suivi-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      scanne: { label: 'Scanné', className: 'bg-gray-100 text-gray-800' },
      en_preparation: { label: 'En préparation', className: 'bg-yellow-100 text-yellow-800' },
      pret_expedition: { label: 'Prêt', className: 'bg-green-100 text-green-800' },
      expedie: { label: 'Expédié', className: 'bg-blue-100 text-blue-800' },
      livre: { label: 'Livré', className: 'bg-purple-100 text-purple-800' },
    };

    const statusConfig = config[status as keyof typeof config];
    return (
      <Badge className={statusConfig?.className || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const pcTypes = ['PC TOUR I5', 'PC TOUR I7', 'PC PORTABLE', 'PC ALL IN ONE', 'PC GAMER'];

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Suivi des PC
              </h1>
              <p className="text-gray-600 mt-1">
                Traçabilité des ordinateurs par type et numéro de série
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtres de recherche
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Type de PC */}
              <div className="space-y-2">
                <Label htmlFor="pcType">Type de PC</Label>
                <Select
                  value={filters.pcType}
                  onValueChange={(value) => handleFilterChange('pcType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {pcTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date de début */}
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date de début</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              {/* Date de fin */}
              <div className="space-y-2">
                <Label htmlFor="dateTo">Date de fin</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="scanne">Scanné</SelectItem>
                    <SelectItem value="en_preparation">En préparation</SelectItem>
                    <SelectItem value="pret_expedition">Prêt expédition</SelectItem>
                    <SelectItem value="expedie">Expédié</SelectItem>
                    <SelectItem value="livre">Livré</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recherche */}
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Numéro de série, client..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total PC</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pcData?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Préparés aujourd&apos;hui</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pcData?.filter(pc => {
                      const today = new Date().toISOString().split('T')[0];
                      return pc.datePreparation?.startsWith(today);
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En préparation</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pcData?.filter(pc => pc.statut === 'en_preparation').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Expédiés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pcData?.filter(pc => pc.statut === 'expedie' || pc.statut === 'livre').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des PC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              Liste des PC ({pcData?.length || 0} résultats)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Chargement des PC...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>Erreur lors du chargement des données</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-2">
                  Réessayer
                </Button>
              </div>
            ) : !pcData?.length ? (
              <div className="text-center py-8 text-gray-500">
                <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun PC trouvé avec ces critères</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type PC</TableHead>
                      <TableHead>Numéro de Série</TableHead>
                      <TableHead>Commande</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date Préparation</TableHead>
                      <TableHead>Date Scan</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pcData.map((pc, index) => (
                      <TableRow key={`${pc.id}-${index}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-blue-600" />
                            {pc.pcType}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {pc.numeroSerie || '-'}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/commandes/${pc.commandeId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {pc.numeroCommande}
                          </Link>
                        </TableCell>
                        <TableCell>{pc.clientName}</TableCell>
                        <TableCell>{getStatusBadge(pc.statut)}</TableCell>
                        <TableCell>
                          {pc.datePreparation
                            ? new Date(pc.datePreparation).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {pc.dateScan
                            ? new Date(pc.dateScan).toLocaleDateString('fr-FR')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Link href={`/commandes/${pc.commandeId}`}>
                            <Button variant="outline" size="sm">
                              Voir commande
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}