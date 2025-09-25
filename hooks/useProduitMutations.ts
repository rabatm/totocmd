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

  // Vérifier si tous les produits sont au moins "prêt expédition"
  const allReady = produits.every(p =>
    p.statut === 'pret_expedition' ||
    p.statut === 'expedie' ||
    p.statut === 'livre'
  );

  // Si tous sont prêts ou plus, la commande est à 100%
  if (allReady) return 100;

  const statusWeights = {
    scanne: 10,
    en_preparation: 40,
    pret_expedition: 80,
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

// Fonction utilitaire pour mettre à jour la progression et le statut en base
const updateProgressionInDB = async (commandeId: string) => {
  const progression = await calculateProgression(commandeId);

  // Préparer les updates
  const updates: { progression: number; etat?: string } = { progression };

  // Si la progression est à 100%, changer le statut de la commande à "pret_expedition"
  if (progression === 100) {
    updates.etat = 'pret_expedition';
  }

  await supabase.from('commandes').update(updates).eq('id', commandeId);
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

// Hook pour supprimer plusieurs produits
export function useBulkDeleteProduits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, commandeId }: { ids: string[]; commandeId: string }) => {
      const promises = ids.map(id =>
        supabase
          .from('commande_produits')
          .delete()
          .eq('id', id)
      );

      const results = await Promise.all(promises);

      // Vérifier s'il y a des erreurs
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Erreur lors de la suppression: ${errors[0].error?.message}`);
      }

      return { deletedIds: ids };
    },
    onSuccess: async (_, variables) => {
      // Mettre à jour la progression
      await updateProgressionInDB(variables.commandeId);

      queryClient.invalidateQueries({
        queryKey: ['commande', variables.commandeId],
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
