'use client';

import { supabase } from '@/lib/supabaseClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Fonction utilitaire pour calculer la progression
const calculateProgression = async (commandeId: string) => {
  // Récupérer tous les produits de la commande
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

// Hook pour mettre à jour le statut d'un produit
export function useUpdateProduitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      produitId,
      commandeId,
      newStatus,
    }: {
      produitId: string;
      commandeId: string;
      newStatus: string;
    }) => {
      const { data, error } = await supabase
        .from('commande_produits')
        .update({ statut: newStatus })
        .eq('id', produitId)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Erreur lors de la mise à jour du statut: ${error.message}`,
        );
      }

      return data;
    },
    onSuccess: async (_, variables) => {
      // Mettre à jour la progression
      await updateProgressionInDB(variables.commandeId);

      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({
        queryKey: ['commande', variables.commandeId],
      });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
    },
  });
}
