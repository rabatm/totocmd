import { CommandeProduit } from '@/src/types';

// Fonction utilitaire pour calculer la progression basée sur les statuts des produits
export const calculateProgression = (produits: CommandeProduit[] | undefined) => {
  if (!produits || produits.length === 0) return 0;

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