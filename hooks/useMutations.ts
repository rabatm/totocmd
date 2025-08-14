'use client';

import { supabase } from '@/lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hook pour modifier le statut d'une commande
export const useUpdateCommandeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, etat }: { id: string; etat: string }) => {
      const { data, error } = await supabase
        .from('commandes')
        .update({
          etat,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }

      return data;
    },
    onSuccess: data => {
      // Invalider les caches pour refraîchir les données
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      queryClient.invalidateQueries({ queryKey: ['commande', data.id] });
    },
  });
};

// Hook pour modifier le statut d'un produit
export const useUpdateProduitStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const { data, error } = await supabase
        .from('commande_produits')
        .update({
          statut,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      queryClient.invalidateQueries({ queryKey: ['commande'] });
    },
  });
};
