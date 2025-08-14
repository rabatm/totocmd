'use client';

import { useProduit } from '@/hooks/useProduits';
import { CommandeProduit } from '@/src/types';

/**
 * Hook pour enrichir un produit de commande avec les informations du catalogue
 */
export function useEnrichedCommandeProduit(commandeProduit: CommandeProduit) {
  // Essayer de récupérer les infos depuis le catalogue en utilisant le code produit
  const produitId = commandeProduit.code_produit
    ? parseInt(commandeProduit.code_produit)
    : undefined;

  const { data: catalogueProduit, isLoading } = useProduit(produitId || 0);

  const isFromCatalog = !!catalogueProduit;

  // Calculer le prix total si disponible
  const prixUnitaire = catalogueProduit?.prix;
  const prixTotal = prixUnitaire
    ? prixUnitaire * commandeProduit.quantite
    : undefined;

  // Informations enrichies
  const enrichedInfo = {
    isFromCatalog,
    isLoading,
    catalogueProduit,
    prixUnitaire,
    prixTotal,
    famille: catalogueProduit?.famille_libelle,
    description: catalogueProduit?.description,
    hasStock: catalogueProduit?.tenue_stock,
    // Note: stock_physique est temporairement commenté dans le type Produit
    // stockLevel: catalogueProduit?.stock_physique,
  };

  return enrichedInfo;
}
