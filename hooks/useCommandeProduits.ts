'use client';

import { supabase } from '@/lib/supabaseClient';
import { CommandeProduit } from '@/src/types';
import { useQuery } from '@tanstack/react-query';

export const useCommandeProduits = (commandeId: string) => {
  return useQuery({
    queryKey: ['commande-produits', commandeId],
    queryFn: async (): Promise<CommandeProduit[]> => {
      const { data, error } = await supabase
        .from('commande_produits')
        .select('*')
        .eq('commande_id', commandeId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des produits: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!commandeId,
  });
};
