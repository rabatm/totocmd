'use client';

import { supabase } from '@/lib/supabaseClient';
import { CommandeWithDetails } from '@/src/types';
import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalCommandes: number;
  commandesEnCours: number;
  commandesExpediees: number;
  commandesEnAttente: number;
  totalProduits: number;
  produitsScannés: number;
  produitsEnPreparation: number;
  produitsPrets: number;
  chiffreAffairesMois: number;
  chiffreAffairesAnnee: number;
  topClients: Array<{
    name: string;
    commandes: number;
    total: number;
  }>;
  commandesParStatut: Array<{
    statut: string;
    count: number;
    percentage: number;
  }>;
  produitsParStatut: Array<{
    statut: string;
    count: number;
    percentage: number;
  }>;
  commandesRecentes: CommandeWithDetails[];
  tendanceMensuelle: Array<{
    mois: string;
    commandes: number;
    chiffre: number;
  }>;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Récupérer toutes les commandes avec détails
      const { data: commandes, error: commandesError } = await supabase
        .from('commandes')
        .select(`
          *,
          clients(id, name),
          commande_produits(id, statut, quantite)
        `)
        .order('created_at', { ascending: false });

      if (commandesError) {
        throw new Error(`Erreur lors de la récupération des commandes: ${commandesError.message}`);
      }

      const commandesData = (commandes || []) as CommandeWithDetails[];

      // Récupérer tous les produits de commandes
      const { data: produits, error: produitsError } = await supabase
        .from('commande_produits')
        .select('*');

      if (produitsError) {
        throw new Error(`Erreur lors de la récupération des produits: ${produitsError.message}`);
      }

      const produitsData = produits || [];

      // Calculs de base
      const totalCommandes = commandesData.length;
      const commandesEnCours = commandesData.filter(c => c.etat === 'en_cours').length;
      const commandesExpediees = commandesData.filter(c => c.etat === 'expedie').length;
      const commandesEnAttente = commandesData.filter(c =>
        c.etat === 'en_attente' || c.etat === 'en_attente_dacompte'
      ).length;

      const totalProduits = produitsData.reduce((sum, p) => sum + p.quantite, 0);
      const produitsScannés = produitsData.filter(p => p.statut === 'scanne').reduce((sum, p) => sum + p.quantite, 0);
      const produitsEnPreparation = produitsData.filter(p => p.statut === 'en_preparation').reduce((sum, p) => sum + p.quantite, 0);
      const produitsPrets = produitsData.filter(p => p.statut === 'pret_expedition').reduce((sum, p) => sum + p.quantite, 0);

      // Chiffre d'affaires
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
      const debutAnnee = new Date(now.getFullYear(), 0, 1);

      const chiffreAffairesMois = commandesData
        .filter(c => c.created_at && new Date(c.created_at) >= debutMois)
        .reduce((sum, c) => sum + c.total_ttc, 0);

      const chiffreAffairesAnnee = commandesData
        .filter(c => c.created_at && new Date(c.created_at) >= debutAnnee)
        .reduce((sum, c) => sum + c.total_ttc, 0);

      // Top clients
      const clientsMap = new Map();
      commandesData.forEach(c => {
        const clientName = c.clients?.name || c.client?.name || 'Client inconnu';
        if (!clientsMap.has(clientName)) {
          clientsMap.set(clientName, { name: clientName, commandes: 0, total: 0 });
        }
        const client = clientsMap.get(clientName);
        client.commandes++;
        client.total += c.total_ttc;
      });

      const topClients = Array.from(clientsMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Répartition par statut des commandes
      const statutsCommandes = commandesData.reduce((acc, c) => {
        acc[c.etat] = (acc[c.etat] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const commandesParStatut = Object.entries(statutsCommandes).map(([statut, count]) => ({
        statut,
        count,
        percentage: Math.round((count / totalCommandes) * 100),
      }));

      // Répartition par statut des produits
      const statutsProduits = produitsData.reduce((acc, p) => {
        acc[p.statut] = (acc[p.statut] || 0) + p.quantite;
        return acc;
      }, {} as Record<string, number>);

      const produitsParStatut = (Object.entries(statutsProduits) as [string, number][]).map(([statut, count]) => ({
        statut,
        count,
        percentage: Math.round((count / totalProduits) * 100),
      }));

      // Commandes récentes (5 dernières)
      const commandesRecentes = commandesData.slice(0, 5);

      // Tendance mensuelle (6 derniers mois)
      const tendanceMensuelle = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const moisSuivant = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const commandesDuMois = commandesData.filter(c =>
          c.created_at &&
          new Date(c.created_at) >= date &&
          new Date(c.created_at) < moisSuivant
        );

        tendanceMensuelle.push({
          mois: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
          commandes: commandesDuMois.length,
          chiffre: commandesDuMois.reduce((sum, c) => sum + c.total_ttc, 0),
        });
      }

      return {
        totalCommandes,
        commandesEnCours,
        commandesExpediees,
        commandesEnAttente,
        totalProduits,
        produitsScannés,
        produitsEnPreparation,
        produitsPrets,
        chiffreAffairesMois,
        chiffreAffairesAnnee,
        topClients,
        commandesParStatut,
        produitsParStatut,
        commandesRecentes,
        tendanceMensuelle,
      };
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
};