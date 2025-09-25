'use client';

import { supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';

export interface PCTrackingItem {
  id: string;
  pcType: string;
  numeroSerie?: string;
  commandeId: string;
  numeroCommande: string;
  clientName: string;
  statut: string;
  datePreparation?: string;
  dateScan?: string;
}

interface PCTrackingFilters {
  pcType: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  search: string;
}

export const usePCTracking = (filters: PCTrackingFilters) => {
  return useQuery({
    queryKey: ['pc-tracking', filters],
    queryFn: async (): Promise<PCTrackingItem[]> => {
      // Construire la requête de base
      let query = supabase
        .from('commande_produits')
        .select(`
          id,
          nom_produit,
          numero_serie,
          statut,
          date_scan,
          commande_id,
          commandes!inner(
            id,
            numero_commande,
            clients(name)
          )
        `)
        .ilike('nom_produit', '%PC%'); // Filtrer uniquement les produits contenant "PC"

      // Appliquer les filtres
      if (filters.pcType && filters.pcType !== 'all') {
        query = query.ilike('nom_produit', `%${filters.pcType}%`);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('statut', filters.status);
      }

      if (filters.search) {
        query = query.or(`numero_serie.ilike.%${filters.search}%,nom_produit.ilike.%${filters.search}%`);
      }

      // Appliquer le filtre de date sur date_scan
      if (filters.dateFrom) {
        query = query.gte('date_scan', `${filters.dateFrom}T00:00:00`);
      }

      if (filters.dateTo) {
        query = query.lte('date_scan', `${filters.dateTo}T23:59:59`);
      }

      // Trier par date de scan décroissante
      query = query.order('date_scan', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erreur lors de la récupération des PC: ${error.message}`);
      }

      // Transformer les données
      const pcItems: PCTrackingItem[] = (data || []).map((item: any) => {
        // Extraire le type de PC du nom du produit
        const nomProduit = item.nom_produit.toUpperCase();
        let pcType = 'PC';

        if (nomProduit.includes('PC TOUR I5')) {
          pcType = 'PC TOUR I5';
        } else if (nomProduit.includes('PC TOUR I7')) {
          pcType = 'PC TOUR I7';
        } else if (nomProduit.includes('PC PORTABLE')) {
          pcType = 'PC PORTABLE';
        } else if (nomProduit.includes('PC ALL IN ONE')) {
          pcType = 'PC ALL IN ONE';
        } else if (nomProduit.includes('PC GAMER')) {
          pcType = 'PC GAMER';
        } else if (nomProduit.includes('PC TOUR')) {
          pcType = 'PC TOUR';
        }

        // Déterminer la date de préparation (quand le statut est passé à en_preparation ou plus)
        const datePreparation =
          item.statut === 'en_preparation' ||
          item.statut === 'pret_expedition' ||
          item.statut === 'expedie' ||
          item.statut === 'livre'
            ? item.date_scan
            : undefined;

        return {
          id: item.id,
          pcType,
          numeroSerie: item.numero_serie,
          commandeId: item.commande_id,
          numeroCommande: item.commandes.numero_commande,
          clientName: item.commandes.clients?.name || 'Client inconnu',
          statut: item.statut,
          datePreparation,
          dateScan: item.date_scan,
        };
      });

      return pcItems;
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
};