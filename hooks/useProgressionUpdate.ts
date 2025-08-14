'use client';

import { supabase } from '@/lib/supabaseClient';
import { CommandeProduit } from '@/src/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hook pour mettre à jour la progression d'une commande basée sur ses produits
export function useProgressionUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commandeId,
      produits,
    }: {
      commandeId: string;
      produits: CommandeProduit[];
    }) => {
      // Calculer la progression
      const statusWeights = {
        scanne: 10,
        en_preparation: 30,
        pret_expedition: 70,
        expedie: 90,
        livre: 100,
      };

      const totalProgress = produits.reduce((sum, produit) => {
        return (
          sum +
          (statusWeights[produit.statut as keyof typeof statusWeights] || 0)
        );
      }, 0);

      const progression = Math.round(totalProgress / produits.length);

      // Mettre à jour la progression en base
      const { data, error } = await supabase
        .from('commandes')
        .update({ progression })
        .eq('id', commandeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: data => {
      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['commande', data.id] });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}
