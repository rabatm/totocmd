'use client';

import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/src/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hook pour créer un nouveau client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      client: Omit<Client, 'id' | 'created_at' | 'updated_at'>,
    ) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Erreur lors de la création du client: ${error.message}`,
        );
      }

      return data;
    },
    onSuccess: () => {
      // Invalider le cache des clients pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
