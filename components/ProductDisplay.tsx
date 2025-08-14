'use client';

import { Badge } from '@/components/ui/badge';
import { useEnrichedCommandeProduit } from '@/hooks/useEnrichedCommandeProduit';
import { CommandeProduit } from '@/src/types';
import { Package, ShoppingCart, Tag } from 'lucide-react';

interface ProductDisplayProps {
  produit: CommandeProduit;
  showPrice?: boolean;
}

export default function ProductDisplay({
  produit,
  showPrice = false,
}: ProductDisplayProps) {
  const { isFromCatalog, catalogueProduit, prixUnitaire, prixTotal } =
    useEnrichedCommandeProduit(produit);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{produit.nom_produit}</span>
        </div>
        {isFromCatalog ? (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 text-xs"
          >
            <Tag className="h-3 w-3 mr-1" />
            Catalogue
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Manuel
          </Badge>
        )}
      </div>

      {showPrice && prixUnitaire && (
        <div className="text-sm text-gray-600">
          {formatPrice(prixUnitaire)} × {produit.quantite} ={' '}
          {formatPrice(prixTotal || 0)}
        </div>
      )}

      {catalogueProduit?.description && (
        <div className="text-sm text-gray-500 truncate max-w-xs">
          {catalogueProduit.description}
        </div>
      )}
    </div>
  );
}
