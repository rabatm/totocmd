'use client';

import { supabase } from '@/lib/supabaseClient';
import { CreateCommandeInput } from '@/src/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hook pour créer une nouvelle commande
export function useCreateCommande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commande: CreateCommandeInput) => {
      const { data, error } = await supabase
        .from('commandes')
        .insert({
          ...commande,
          etat: 'en_attente', // Statut initial
          progression: 0, // Progression initiale
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la création: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalider le cache des commandes pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}

// Hook pour mettre à jour une commande existante
export function useUpdateCommande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateCommandeInput> }) => {
      // Filtrer les champs undefined
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) => value !== undefined)
      );

      const { data, error } = await supabase
        .from('commandes')
        .update(filteredUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalider le cache des commandes pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}
