'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useBulkProductUpdate } from '@/hooks/useBulkProductUpdate';
import { CommandeProduit } from '@/src/types';
import { CheckCircle, Loader2, Package } from 'lucide-react';
import { useState } from 'react';

interface BulkStatusButtonProps {
  commandeId: string;
  products: CommandeProduit[];
  targetStatus: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
}

const statusLabels = {
  scanne: 'Scanné',
  en_preparation: 'En préparation',
  pret_expedition: 'Prêt expédition',
  expedie: 'Expédié',
  livre: 'Livré',
};

export default function BulkStatusButton({
  commandeId,
  products,
  targetStatus,
  label,
  icon,
  variant = 'outline',
  className = '',
}: BulkStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bulkUpdate = useBulkProductUpdate();

  // Filtrer les produits qui ne sont pas déjà au statut cible
  const productsToUpdate = products.filter(p => p.statut !== targetStatus);
  const isDisabled = productsToUpdate.length === 0;

  const handleBulkUpdate = async () => {
    if (productsToUpdate.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({
        commandeId,
        newStatus: targetStatus,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour en lot:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pret_expedition':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expedie':
        return <Package className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getConfirmationMessage = () => {
    const statusLabel = statusLabels[targetStatus as keyof typeof statusLabels] || targetStatus;
    return `Êtes-vous sûr de vouloir changer le statut de ${productsToUpdate.length} produit(s) vers "${statusLabel}" ?`;
  };


  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          disabled={isDisabled || bulkUpdate.isPending}
          className={className}
        >
          {bulkUpdate.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            icon || getStatusIcon(targetStatus)
          )}
          {label}
          {productsToUpdate.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {productsToUpdate.length}
            </span>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {getStatusIcon(targetStatus)}
            Mise à jour en lot
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{getConfirmationMessage()}</p>

            {productsToUpdate.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Produits concernés :</h4>
                <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {productsToUpdate.slice(0, 10).map((product) => (
                    <li key={product.id} className="flex items-center gap-2">
                      <Package className="h-3 w-3" />
                      {product.nom_produit}
                      {product.numero_serie && (
                        <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                          {product.numero_serie}
                        </span>
                      )}
                    </li>
                  ))}
                  {productsToUpdate.length > 10 && (
                    <li className="text-gray-500 italic">
                      ... et {productsToUpdate.length - 10} autres
                    </li>
                  )}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleBulkUpdate}
            disabled={bulkUpdate.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {bulkUpdate.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                {getStatusIcon(targetStatus)}
                <span className="ml-2">Confirmer</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}