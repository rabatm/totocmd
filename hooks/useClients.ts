'use client';

import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/src/types';
import { useQuery } from '@tanstack/react-query';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase.from('clients').select('*');

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des clients: ${error.message}`,
        );
      }

      return data || [];
    },
  });
};

export const useClient = (id: number) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async (): Promise<Client | null> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(
          `Erreur lors de la récupération du client: ${error.message}`,
        );
      }

      return data;
    },
    enabled: !!id,
  });
};
