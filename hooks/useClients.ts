'use client';

import { supabase } from '@/lib/supabaseClient';
import { Client } from '@/src/types';
import { useQuery } from '@tanstack/react-query';

interface ClientWithStats extends Client {
  commandes_count?: number;
  total_commandes_ttc?: number;
  last_commande_date?: string;
}

// Hook pour récupérer tous les clients avec leurs statistiques
export const useClients = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async (): Promise<ClientWithStats[]> => {
      let query = supabase.from('clients').select('*').order('name', { ascending: true });

      // Si searchTerm fourni, filtrer
      if (searchTerm && searchTerm.length >= 3) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data: clients, error } = await query;

      if (error) {
        throw new Error(`Erreur lors de la récupération des clients: ${error.message}`);
      }

      // Pour chaque client, récupérer ses statistiques de commandes
      const clientsWithStats = await Promise.all(
        (clients || []).map(async (client) => {
          // Compter les commandes du client
          const { count: commandesCount } = await supabase
            .from('commandes')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id);

          // Récupérer le total TTC et la dernière commande
          const { data: commandes } = await supabase
            .from('commandes')
            .select('total_ttc, date_commande')
            .eq('client_id', client.id)
            .order('date_commande', { ascending: false });

          const totalTTC = commandes?.reduce((sum, cmd) => sum + (cmd.total_ttc || 0), 0) || 0;
          const lastCommandeDate = commandes?.[0]?.date_commande;

          return {
            ...client,
            commandes_count: commandesCount || 0,
            total_commandes_ttc: totalTTC,
            last_commande_date: lastCommandeDate,
          };
        })
      );

      return clientsWithStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Hook pour les statistiques des clients
export const useClientsStats = () => {
  return useQuery({
    queryKey: ['clients-stats'],
    queryFn: async () => {
      // Compter le total de clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // Clients actifs ce mois (ayant au moins une commande ce mois)
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: activeClients } = await supabase
        .from('commandes')
        .select('client_id')
        .gte('date_commande', firstDayOfMonth);

      const uniqueActiveClients = new Set(activeClients?.map(c => c.client_id) || []).size;

      // Nouveaux clients ce mois
      const { count: newClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth);

      return {
        totalClients: totalClients || 0,
        activeThisMonth: uniqueActiveClients,
        newThisMonth: newClients || 0,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
