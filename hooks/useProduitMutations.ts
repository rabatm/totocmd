'use client';

import { supabase } from '@/lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Fonction utilitaire pour calculer la progression
const calculateProgression = async (commandeId: string) => {
  // Récupérer tous les produits de la commande
  const { data: produits, error } = await supabase
    .from('commande_produits')
    .select('statut')
    .eq('commande_id', commandeId);

  if (error || !produits || produits.length === 0) {
    return 0;
  }

  const statusWeights = {
    scanne: 10,
    en_preparation: 30,
    pret_expedition: 70,
    expedie: 90,
    livre: 100,
  };

  const totalProgress = produits.reduce((sum, produit) => {
    return (
      sum + (statusWeights[produit.statut as keyof typeof statusWeights] || 0)
    );
  }, 0);

  return Math.round(totalProgress / produits.length);
};

// Fonction utilitaire pour mettre à jour la progression en base
const updateProgressionInDB = async (commandeId: string) => {
  const progression = await calculateProgression(commandeId);

  await supabase.from('commandes').update({ progression }).eq('id', commandeId);
};

// Hook pour ajouter un produit à une commande
export function useAddProduit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produit: {
      commande_id: string;
      personnel_id: number;
      nom_produit: string;
      code_produit?: string;
      numero_serie?: string;
      quantite: number;
      statut: string;
      remarque?: string;
    }) => {
      const { data, error } = await supabase
        .from('commande_produits')
        .insert({
          ...produit,
          date_scan: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de l'ajout: ${error.message}`);
      }

      return data;
    },
    onSuccess: async (_, variables) => {
      // Mettre à jour la progression
      await updateProgressionInDB(variables.commande_id);

      // Invalider le cache de la commande pour rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ['commande', variables.commande_id],
      });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}

// Hook pour supprimer un produit
export function useDeleteProduit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; commande_id: string }) => {
      const { error } = await supabase
        .from('commande_produits')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erreur lors de la suppression: ${error.message}`);
      }

      return { id };
    },
    onSuccess: async (_, variables) => {
      // Mettre à jour la progression
      await updateProgressionInDB(variables.commande_id);

      queryClient.invalidateQueries({
        queryKey: ['commande', variables.commande_id],
      });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}

// Hook pour modifier un produit
export function useUpdateProduit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      commande_id: string;
      updates: {
        nom_produit?: string;
        code_produit?: string;
        numero_serie?: string;
        quantite?: number;
        remarque?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from('commande_produits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la modification: ${error.message}`);
      }

      return data;
    },
    onSuccess: async (_, variables) => {
      // Mettre à jour la progression
      await updateProgressionInDB(variables.commande_id);

      queryClient.invalidateQueries({
        queryKey: ['commande', variables.commande_id],
      });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}
