'use client';

import { supabase } from '@/lib/supabaseClient';
import { Produit } from '@/src/types';
import { useQuery } from '@tanstack/react-query';

// Hook pour récupérer tous les produits
export const useProduits = (options?: {
  search?: string;
  familleId?: number;
  tenueStock?: boolean;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['produits', options],
    queryFn: async (): Promise<Produit[]> => {
      let query = supabase.from('produits').select('*');

      // Filtres optionnels
      if (options?.search) {
        query = query.or(
          `libelle.ilike.%${options.search}%, code.ilike.%${options.search}%, description.ilike.%${options.search}%`,
        );
      }

      if (options?.familleId) {
        query = query.eq('famille_id', options.familleId);
      }

      if (options?.tenueStock !== undefined) {
        query = query.eq('tenue_stock', options.tenueStock);
      }

      // Tri et limite
      query = query.order('libelle', { ascending: true });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des produits: ${error.message}`,
        );
      }

      return data || [];
    },
  });
};

// Hook pour récupérer un produit par ID
export const useProduit = (id: number) => {
  return useQuery({
    queryKey: ['produit', id],
    queryFn: async (): Promise<Produit | null> => {
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Produit non trouvé
        }
        throw new Error(
          `Erreur lors de la récupération du produit: ${error.message}`,
        );
      }

      return data;
    },
    enabled: !!id,
  });
};

// Hook pour récupérer les familles de produits
export const useFamilles = () => {
  return useQuery({
    queryKey: ['familles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produits')
        .select('famille_id, famille_libelle')
        .not('famille_id', 'is', null)
        .not('famille_libelle', 'is', null);

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des familles: ${error.message}`,
        );
      }

      // Dédoublonner les familles
      const familles = data?.reduce((acc, item) => {
        if (!acc.find(f => f.id === item.famille_id)) {
          acc.push({
            id: item.famille_id!,
            libelle: item.famille_libelle!,
          });
        }
        return acc;
      }, [] as Array<{ id: number; libelle: string }>);

      return familles?.sort((a, b) => a.libelle.localeCompare(b.libelle)) || [];
    },
  });
};

// Hook pour récupérer les sous-familles de produits
export const useSousFamilles = (familleId?: number) => {
  return useQuery({
    queryKey: ['sousFamilles', familleId],
    queryFn: async () => {
      let query = supabase
        .from('produits')
        .select('sous_famille_id, sous_famille_libelle, famille_id')
        .not('sous_famille_id', 'is', null)
        .not('sous_famille_libelle', 'is', null);

      if (familleId) {
        query = query.eq('famille_id', familleId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des sous-familles: ${error.message}`,
        );
      }

      // Dédoublonner les sous-familles
      const sousFamilles = data?.reduce((acc, item) => {
        if (!acc.find(sf => sf.id === item.sous_famille_id)) {
          acc.push({
            id: item.sous_famille_id!,
            libelle: item.sous_famille_libelle!,
            famille_id: item.famille_id,
          });
        }
        return acc;
      }, [] as Array<{ id: number; libelle: string; famille_id?: number }>);

      return (
        sousFamilles?.sort((a, b) => a.libelle.localeCompare(b.libelle)) || []
      );
    },
    enabled: familleId === undefined || !!familleId,
  });
};

// Hook pour les statistiques des produits
export const useProduitsStats = () => {
  return useQuery({
    queryKey: ['produitsStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produits')
        .select('tenue_stock, famille_libelle, prix');

      if (error) {
        throw new Error(
          `Erreur lors de la récupération des statistiques: ${error.message}`,
        );
      }

      const stats = {
        total: data?.length || 0,
        enStock: data?.filter(p => p.tenue_stock).length || 0,
        horsStock: data?.filter(p => !p.tenue_stock).length || 0,
        familles: new Set(data?.map(p => p.famille_libelle).filter(Boolean))
          .size,
        prixMoyen: data?.length
          ? data.reduce((sum, p) => sum + p.prix, 0) / data.length
          : 0,
        prixMin: data?.length ? Math.min(...data.map(p => p.prix)) : 0,
        prixMax: data?.length ? Math.max(...data.map(p => p.prix)) : 0,
      };

      return stats;
    },
  });
};
