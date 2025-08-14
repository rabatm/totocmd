'use client';

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
import { useCommandes } from '@/hooks/useCommandes';
import { Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ClientName from './ClientName';
import CommandeStatusBadge from './CommandeStatusBadge';

export default function CommandesList() {
  const { data: commandes, isLoading, error } = useCommandes();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des commandes...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <p>Erreur lors du chargement des commandes:</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!commandes || commandes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <p>Aucune commande trouvée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des commandes ({commandes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Progression</TableHead>
              <TableHead>Total TTC</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commandes.map(commande => (
              <TableRow key={commande.id}>
                <TableCell className="font-medium">
                  {commande.numero_commande}
                </TableCell>
                <TableCell>
                  <ClientName clientId={commande.client_id} />
                </TableCell>
                <TableCell>{formatDate(commande.date_commande)}</TableCell>
                <TableCell>
                  <CommandeStatusBadge status={commande.etat} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${commande.progression}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {commande.progression}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(commande.total_ttc)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">0 produit(s)</div>
                </TableCell>
                <TableCell>
                  <Link href={`/commandes/${commande.id}`}>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
