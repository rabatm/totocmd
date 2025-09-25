'use client';

import { supabase } from '@/lib/supabaseClient';
import { CreateMouvementStockInput, MouvementStock, Produit } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Hook pour récupérer tous les produits avec leur stock
export const useProduits = () => {
  return useQuery({
    queryKey: ['produits'],
    queryFn: async (): Promise<Produit[]> => {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('tenue_stock', true) // Seulement les produits avec gestion de stock
        .order('libelle', { ascending: true });

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des produits: ${error.message}`,
        );
      }

      return data || [];
    },
  });
};

// Hook pour récupérer un produit par son code
export const useProduitByCode = (code: string) => {
  return useQuery({
    queryKey: ['produit', code],
    queryFn: async (): Promise<Produit | null> => {
      if (!code) return null;

      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        throw new Error(
          `Erreur lors de la récupération du produit: ${error.message}`,
        );
      }

      return data;
    },
    enabled: !!code,
  });
};

// Hook pour créer un mouvement de stock
export const useCreateMouvementStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mouvement: CreateMouvementStockInput) => {
      // 1. Récupérer le stock actuel du produit
      const { data: produit, error: produitError } = await supabase
        .from('produits')
        .select('stock_physique')
        .eq('id', mouvement.produit_id)
        .single();

      if (produitError) {
        throw new Error(`Erreur produit: ${produitError.message}`);
      }

      const stockActuel = produit?.stock_physique || 0;
      let nouveauStock: number;
      let quantiteMouvement: number;

      // 2. Calculer le nouveau stock selon le type
      if (mouvement.type_mouvement === 'inventaire') {
        // Inventaire : fixe le stock à la quantité donnée
        nouveauStock = mouvement.quantite_mouvement;
        quantiteMouvement = nouveauStock - stockActuel;
      } else {
        // Réception : ajoute au stock existant
        nouveauStock = stockActuel + mouvement.quantite_mouvement;
        quantiteMouvement = mouvement.quantite_mouvement;
      }

      // 3. Créer le mouvement de stock
      const { data: mouvementData, error: mouvementError } = await supabase
        .from('mouvements_stock')
        .insert({
          produit_id: mouvement.produit_id,
          type_mouvement: mouvement.type_mouvement,
          quantite_avant: stockActuel,
          quantite_apres: nouveauStock,
          quantite_mouvement: quantiteMouvement,
          prix_unitaire: mouvement.prix_unitaire,
          fournisseur: mouvement.fournisseur,
          numero_facture: mouvement.numero_facture,
          date_entree: mouvement.date_entree,
          remarques: mouvement.remarques,
        })
        .select()
        .single();

      if (mouvementError) {
        throw new Error(`Erreur mouvement: ${mouvementError.message}`);
      }

      // 4. Mettre à jour le stock du produit
      const { error: updateError } = await supabase
        .from('produits')
        .update({ stock_physique: nouveauStock })
        .eq('id', mouvement.produit_id);

      if (updateError) {
        throw new Error(`Erreur mise à jour stock: ${updateError.message}`);
      }

      return mouvementData;
    },
    onSuccess: () => {
      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['mouvements_stock'] });
    },
  });
};

// Hook pour récupérer les mouvements de stock d'un produit
export const useMouvementsStock = (produitId: number) => {
  return useQuery({
    queryKey: ['mouvements_stock', produitId],
    queryFn: async (): Promise<MouvementStock[]> => {
      if (!produitId) return [];

      const { data, error } = await supabase
        .from('mouvements_stock')
        .select('*')
        .eq('produit_id', produitId)
        .order('date_mouvement', { ascending: false });

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des mouvements de stock: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!produitId,
  });
};

// Hook pour récupérer les stocks réservés (produits dans les commandes)
export const useStockReserve = () => {
  return useQuery({
    queryKey: ['stock-reserve'],
    queryFn: async (): Promise<Record<string, number>> => {
      // Récupérer les produits réservés depuis les commandes
      const { data, error } = await supabase
        .from('commande_produits')
        .select(`
          code_produit,
          quantite,
          statut,
          commandes!inner(etat)
        `)
        .in('statut', ['reserve', 'en_preparation', 'pret_expedition'])
        .in('commandes.etat', ['en_attente', 'en_cours', 'pret_expedition']);

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des stocks réservés: ${error.message}`,
        );
      }

      // Agréger par code produit
      const stockReserve: Record<string, number> = {};
      (data || []).forEach(item => {
        if (item.code_produit) {
          stockReserve[item.code_produit] = (stockReserve[item.code_produit] || 0) + item.quantite;
        }
      });

      return stockReserve;
    },
  });
};

// Hook pour récupérer les stocks en commande clients (produits scannés)
export const useStockEnCommande = () => {
  return useQuery({
    queryKey: ['stock-en-commande'],
    queryFn: async (): Promise<Record<string, number>> => {
      // Récupérer les produits scannés dans les commandes actives
      const { data, error } = await supabase
        .from('commande_produits')
        .select(`
          code_produit,
          quantite,
          statut,
          commandes!inner(etat)
        `)
        .eq('statut', 'scanne')
        .in('commandes.etat', ['en_attente', 'en_cours', 'pret_expedition']);

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des stocks en commande: ${error.message}`,
        );
      }

      // Agréger par code produit
      const stockEnCommande: Record<string, number> = {};
      (data || []).forEach(item => {
        if (item.code_produit) {
          stockEnCommande[item.code_produit] = (stockEnCommande[item.code_produit] || 0) + item.quantite;
        }
      });

      return stockEnCommande;
    },
  });
};