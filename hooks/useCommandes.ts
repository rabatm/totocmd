import { supabase } from '@/lib/supabaseClient';
import { Client, CommandeWithDetails } from '@/src/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useCommandes = () => {
  return useQuery({
    queryKey: ['commandes'],
    queryFn: async (): Promise<CommandeWithDetails[]> => {
      // Récupérer les commandes avec leurs produits pour calculer la progression
      const { data, error } = await supabase
        .from('commandes')
        .select(`
          *,
          clients(
            id,
            name,
            email,
            phone,
            address,
            city,
            postal_code,
            country
          ),
          commande_produits(
            id,
            nom_produit,
            code_produit,
            numero_serie,
            quantite,
            statut,
            date_scan,
            remarque,
            personnel_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des commandes: ${error.message}`,
        );
      }

      return data || [];
    },
  });
};

export const useCommande = (id: string) => {
  return useQuery({
    queryKey: ['commande', id],
    queryFn: async (): Promise<CommandeWithDetails | null> => {
      const { data, error } = await supabase
        .from('commandes')
        .select(
          `
          *,
          clients(
            id,
            name,
            email,
            phone,
            address,
            city,
            postal_code,
            country
          ),
          commande_produits(
            id,
            nom_produit,
            code_produit,
            numero_serie,
            quantite,
            statut,
            date_scan,
            remarque,
            personnel_id
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(
          `Erreur lors de la récupération de la commande: ${error.message}`,
        );
      }

      return data;
    },
    enabled: !!id,
  });
};

// Hook pour récupérer la liste des clients
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des clients: ${error.message}`,
        );
      }

      return data || [];
    },
  });
};

// Hook pour les mutations (creation, update, delete)
export const useCommandeMutations = () => {
  const queryClient = useQueryClient();

  const invalidateCommandes = () => {
    queryClient.invalidateQueries({ queryKey: ['commandes'] });
  };

  return {
    invalidateCommandes,
  };
};
