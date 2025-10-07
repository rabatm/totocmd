import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShipmentWithDetails, CreateShipmentInput, UpdateShipmentStatusInput } from '@/src/types';

export interface UseShipmentsFilters {
  search?: string;
  statut?: string;
  commande_id?: string;
  preparateur_id?: string;
  verificateur_id?: string;
  limit?: number;
  offset?: number;
}

export const useShipments = (filters?: UseShipmentsFilters) => {
  return useQuery({
    queryKey: ['shipments', filters],
    queryFn: async (): Promise<{ data: ShipmentWithDetails[]; total: number }> => {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.statut) params.append('statut', filters.statut);
      if (filters?.commande_id) params.append('commande_id', filters.commande_id);
      if (filters?.preparateur_id) params.append('preparateur_id', filters.preparateur_id);
      if (filters?.verificateur_id) params.append('verificateur_id', filters.verificateur_id);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/shipments?${params}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des expéditions');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useShipment = (shipmentId: string | number | null) => {
  return useQuery({
    queryKey: ['shipment', shipmentId],
    queryFn: async (): Promise<{ data: ShipmentWithDetails }> => {
      if (!shipmentId) throw new Error('ID expédition requis');

      const response = await fetch(`/api/shipments/${shipmentId}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'expédition');
      }

      return response.json();
    },
    enabled: !!shipmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour créer une nouvelle expédition
export const useCreateShipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateShipmentInput): Promise<{ data: ShipmentWithDetails; message: string }> => {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de l\'expédition');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment', data.data.id] });

      if (data.data.commande_id) {
        queryClient.invalidateQueries({ queryKey: ['commande', data.data.commande_id] });
      }
    },
  });
};

// Hook pour mettre à jour le statut d'une expédition
export const useUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shipmentId, ...input }: UpdateShipmentStatusInput & { shipmentId: number }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour du statut');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] });
    },
  });
};

// Hook pour les statistiques des expéditions
export const useShipmentsStats = () => {
  return useQuery({
    queryKey: ['shipment-stats'],
    queryFn: async () => {
      const response = await fetch('/api/shipments/stats');

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer les expéditions d'une commande spécifique
export const useShipmentsByCommande = (commandeId: string | null) => {
  return useQuery({
    queryKey: ['shipments-by-commande', commandeId],
    queryFn: async (): Promise<{ data: ShipmentWithDetails[]; total: number }> => {
      if (!commandeId) throw new Error('ID commande requis');

      const params = new URLSearchParams();
      params.append('commande_id', commandeId);

      const response = await fetch(`/api/shipments?${params}`);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des expéditions');
      }

      return response.json();
    },
    enabled: !!commandeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook pour invalider les caches shipments
export const useInvalidateShipments = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment'] });
      queryClient.invalidateQueries({ queryKey: ['shipments-stats'] });
    },
    invalidateList: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments-stats'] });
    },
    invalidateShipment: (shipmentId: string | number) => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    }
  };
};