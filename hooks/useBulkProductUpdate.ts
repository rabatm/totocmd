'use client';

import { supabase } from '@/lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Fonction utilitaire pour calculer la progression
const calculateProgression = async (commandeId: string) => {
  const { data: produits, error } = await supabase
    .from('commande_produits')
    .select('statut')
    .eq('commande_id', commandeId);

  if (error || !produits || produits.length === 0) {
    return 0;
  }

  // Vérifier si tous les produits sont au moins "prêt expédition"
  const allReady = produits.every(p =>
    p.statut === 'pret_expedition' ||
    p.statut === 'expedie' ||
    p.statut === 'livre'
  );

  // Si tous sont prêts ou plus, la commande est à 100%
  if (allReady) return 100;

  const statusWeights = {
    scanne: 10,
    en_preparation: 40,
    pret_expedition: 80,
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

// Fonction utilitaire pour mettre à jour la progression et le statut en base
const updateProgressionInDB = async (commandeId: string) => {
  const progression = await calculateProgression(commandeId);

  // Préparer les updates
  const updates: { progression: number; etat?: string } = { progression };

  // Si la progression est à 100%, changer le statut de la commande à "pret_expedition"
  if (progression === 100) {
    updates.etat = 'pret_expedition';
  }

  await supabase.from('commandes').update(updates).eq('id', commandeId);
};

export const useBulkProductUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commandeId,
      newStatus,
      productIds,
    }: {
      commandeId: string;
      newStatus: string;
      productIds?: string[]; // Si fourni, met à jour seulement ces produits
    }) => {
      let query = supabase
        .from('commande_produits')
        .update({ statut: newStatus })
        .eq('commande_id', commandeId);

      // Si des IDs spécifiques sont fournis, les filtrer
      if (productIds && productIds.length > 0) {
        query = query.in('id', productIds);
      }

      const { data, error } = await query.select();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour des produits: ${error.message}`);
      }

      return data;
    },
    onSuccess: async (_, variables) => {
      // Mettre à jour la progression en base
      await updateProgressionInDB(variables.commandeId);

      // Invalider les requêtes liées à cette commande
      queryClient.invalidateQueries({ queryKey: ['commande', variables.commandeId] });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pc-tracking'] });
    },
  });
};