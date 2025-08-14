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

// Hook pour mettre à jour le statut d'un produit
export function useUpdateProduitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      produitId,
      commandeId,
      newStatus,
    }: {
      produitId: string;
      commandeId: string;
      newStatus: string;
    }) => {
      const { data, error } = await supabase
        .from('commande_produits')
        .update({ statut: newStatus })
        .eq('id', produitId)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Erreur lors de la mise à jour du statut: ${error.message}`,
        );
      }

      return data;
    },
    onSuccess: async (_, variables) => {
      // Mettre à jour la progression
      await updateProgressionInDB(variables.commandeId);

      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ['commande', variables.commandeId],
      });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}
