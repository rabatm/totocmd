'use client';

import { supabase } from '@/lib/supabaseClient';
import { Produit } from '@/src/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Hook pour synchroniser les produits depuis Extrabat
export const useSyncProduitsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sync-produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la synchronisation');
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalider toutes les queries liées aux produits
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['familles'] });
      queryClient.invalidateQueries({ queryKey: ['sousFamilles'] });
      queryClient.invalidateQueries({ queryKey: ['produitsStats'] });
    },
    onError: error => {
      console.error('Erreur lors de la synchronisation:', error);
    },
  });
};

// Hook pour créer un produit manuellement
export const useCreateProduitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      produit: Omit<Produit, 'id' | 'created_at' | 'updated_at'>,
    ) => {
      const { data, error } = await supabase
        .from('produits')
        .insert([
          {
            ...produit,
            is_manuel: true, // Marquer comme produit manuel
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(
          `Erreur lors de la création du produit: ${error.message}`,
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['produitsStats'] });
    },
  });
};

// Hook pour mettre à jour un produit
export const useUpdateProduitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      produit,
    }: {
      id: number;
      produit: Partial<Omit<Produit, 'id' | 'created_at' | 'updated_at'>>;
    }) => {
      const { data, error } = await supabase
        .from('produits')
        .update(produit)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Erreur lors de la mise à jour du produit: ${error.message}`,
        );
      }

      return data;
    },
    onSuccess: data => {
      // Mise à jour optimiste du cache
      queryClient.setQueryData(['produit', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['produitsStats'] });
    },
  });
};

// Hook pour supprimer un produit
export const useDeleteProduitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      // Vérifier d'abord s'il y a des commandes associées
      const { data: commandes, error: commandesError } = await supabase
        .from('commande_produits')
        .select('id')
        .eq('produit_id', id)
        .limit(1);

      if (commandesError) {
        throw new Error(
          `Erreur lors de la vérification des commandes: ${commandesError.message}`,
        );
      }

      if (commandes && commandes.length > 0) {
        throw new Error(
          'Ce produit ne peut pas être supprimé car il est associé à des commandes.',
        );
      }

      const { error } = await supabase.from('produits').delete().eq('id', id);

      if (error) {
        throw new Error(
          `Erreur lors de la suppression du produit: ${error.message}`,
        );
      }

      return id;
    },
    onSuccess: id => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: ['produit', id] });
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['produitsStats'] });
    },
  });
};

// Hook pour mettre à jour les prix en lot
export const useBulkUpdatePrixMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      coefficient,
    }: {
      ids: number[];
      coefficient: number;
    }) => {
      // Récupérer les produits actuels
      const { data: produits, error: fetchError } = await supabase
        .from('produits')
        .select('id, prix')
        .in('id', ids);

      if (fetchError) {
        throw new Error(
          `Erreur lors de la récupération des produits: ${fetchError.message}`,
        );
      }

      // Mettre à jour les prix
      const updates = produits.map(p => ({
        id: p.id,
        prix: Math.round(p.prix * coefficient * 100) / 100, // Arrondir à 2 décimales
      }));

      const promises = updates.map(update =>
        supabase
          .from('produits')
          .update({ prix: update.prix })
          .eq('id', update.id),
      );

      const results = await Promise.all(promises);

      // Vérifier s'il y a des erreurs
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(
          `Erreur lors de la mise à jour en lot: ${errors[0].error?.message}`,
        );
      }

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['produitsStats'] });
    },
  });
};

// Hook pour archiver/désarchiver des produits
export const useArchiveProduitsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      archived,
    }: {
      ids: number[];
      archived: boolean;
    }) => {
      const { error } = await supabase
        .from('produits')
        .update({ archived })
        .in('id', ids);

      if (error) {
        throw new Error(`Erreur lors de l'archivage: ${error.message}`);
      }

      return { ids, archived };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['produitsStats'] });
    },
  });
};
