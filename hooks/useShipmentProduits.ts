'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { ShipmentProduit } from '@/src/types';

// Hook pour récupérer les produits d'une expédition
export function useShipmentProduits(shipmentId: number) {
  return useQuery({
    queryKey: ['shipment-produits', shipmentId],
    queryFn: async (): Promise<ShipmentProduit[]> => {
      if (!shipmentId) return [];

      const { data, error } = await supabase
        .from('shipment_produits')
        .select(`
          *,
          commande_produit:commande_produits (
            id,
            nom_produit,
            code_produit,
            numero_serie,
            statut,
            remarque,
            quantite
          )
        `)
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Erreur lors de la récupération des produits: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!shipmentId && shipmentId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

// Hook pour récupérer un produit d'expédition spécifique
export function useShipmentProduit(shipmentId: number, produitId: string) {
  return useQuery({
    queryKey: ['shipment-produit', shipmentId, produitId],
    queryFn: async (): Promise<ShipmentProduit | null> => {
      if (!shipmentId || !produitId) return null;

      const { data, error } = await supabase
        .from('shipment_produits')
        .select(`
          *,
          commande_produit:commande_produits (
            id,
            nom_produit,
            code_produit,
            numero_serie,
            statut,
            remarque,
            quantite
          )
        `)
        .eq('shipment_id', shipmentId)
        .eq('commande_produit_id', produitId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Aucun résultat trouvé
        }
        throw new Error(`Erreur lors de la récupération du produit: ${error.message}`);
      }

      return data;
    },
    enabled: !!shipmentId && shipmentId > 0 && !!produitId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

// Hook pour calculer les totaux des produits d'une expédition
export function useShipmentTotals(shipmentId: number) {
  const { data: produits, isLoading } = useShipmentProduits(shipmentId);

  const totals = {
    totalHt: 0,
    totalTtc: 0,
    totalTva: 0,
    totalQuantity: 0,
    productCount: 0
  };

  if (!isLoading && produits) {
    totals.productCount = produits.length;

    produits.forEach(produit => {
      const quantiteExpediee = produit.quantite_expediee || 0;
      const prixHt = produit.prix_unitaire_ht || 0;
      const prixTtc = produit.prix_unitaire_ttc || 0;

      totals.totalHt += prixHt * quantiteExpediee;
      totals.totalTtc += prixTtc * quantiteExpediee;
      totals.totalQuantity += quantiteExpediee;
    });

    totals.totalTva = totals.totalTtc - totals.totalHt;
  }

  return {
    ...totals,
    isLoading,
    produits
  };
}