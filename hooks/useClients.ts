'use client';

import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/src/types';
import { useQuery } from '@tanstack/react-query';

export const useClients = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async (): Promise<Client[]> => {
      if (!searchTerm || searchTerm.length < 3) {
        return []; // Retourner un tableau vide si moins de 3 caractères
      }

      let query = supabase.from('clients').select('*').limit(100); // Réduire la limite car on filtre

      // Rechercher dans le nom et l'email
      query = query.or(
        `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
      );

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des clients: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!searchTerm && searchTerm.length >= 3, // Activer seulement si 3+ caractères
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
