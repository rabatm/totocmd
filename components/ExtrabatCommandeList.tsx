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
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Euro, FileText, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ExtrabatCommande {
  id: string;
  code: string; // Le numéro de commande est dans "code"
  date: string;
  titre: string; // Le libellé est dans "titre"
  totalTTC: number; // Le montant TTC est dans "totalTTC"
  type: number;
  etatLettrage?: number;
  transformationState?: number;
  client?: {
    id: number;
    nom: string;
    email?: string;
  };
}

interface ExtrabatCommandeListProps {
  clientId: string;
  clientExtrabatId: string;
}

export default function ExtrabatCommandeList({
  clientId,
  clientExtrabatId,
}: ExtrabatCommandeListProps) {
  const [commandes, setCommandes] = useState<ExtrabatCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const router = useRouter();

  const loadCommandes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/extrabat/commandes/${clientExtrabatId}`);
      const data = await response.json();

      if (data.success) {
        setCommandes(data.commandes);
      } else {
        setError(data.error || 'Erreur lors du chargement des commandes');
      }
    } catch (err) {
      setError('Erreur de connexion à ExtraBat');
      console.error('Erreur chargement commandes:', err);
    } finally {
      setLoading(false);
    }
  }, [clientExtrabatId]);

  useEffect(() => {
    if (clientExtrabatId) {
      loadCommandes();
    }
  }, [clientExtrabatId, loadCommandes]);

  const handleImportCommande = async (pieceId: string) => {
    setImporting(pieceId);
    setError(null);

    try {
      const response = await fetch('/api/import-commande-extrabat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pieceId,
          localClientId: clientId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Rediriger vers la commande créée
        router.push(`/commandes/${data.commandeId}`);
      } else {
        setError(data.error || 'Erreur lors de l\'import');
      }
    } catch (err) {
      setError('Erreur lors de l\'import de la commande');
      console.error('Erreur import commande:', err);
    } finally {
      setImporting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getStatutColor = (transformationState?: number) => {
    // ExtraBat utilise transformationState pour le statut
    // 0 = En cours, 1 = Validé, 2 = Livré/Facturé
    switch (transformationState) {
      case 0:
        return 'destructive'; // En cours - rouge
      case 1:
        return 'default'; // Validé - gris
      case 2:
        return 'secondary'; // Livré/Facturé - vert
      default:
        return 'outline'; // Inconnu
    }
  };

  const getStatutText = (transformationState?: number) => {
    switch (transformationState) {
      case 0:
        return 'En cours';
      case 1:
        return 'Validé';
      case 2:
        return 'Livré';
      default:
        return 'Inconnu';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Chargement des commandes ExtraBat...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={loadCommandes}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Commandes disponibles dans ExtraBat
        </CardTitle>
      </CardHeader>
      <CardContent>
        {commandes.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            Aucune commande trouvée pour ce client dans ExtraBat
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commandes.map((commande) => (
                <TableRow key={commande.id}>
                  <TableCell className="font-medium">
                    {commande.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      {formatDate(commande.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={commande.titre}>
                      {commande.titre || 'Sans titre'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm font-medium">
                      <Euro className="h-4 w-4 mr-1" />
                      {formatPrice(commande.totalTTC)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatutColor(commande.transformationState)}>
                      {getStatutText(commande.transformationState)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleImportCommande(commande.id)}
                      disabled={importing === commande.id}
                      size="sm"
                    >
                      {importing === commande.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Import...
                        </>
                      ) : (
                        'Importer'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}