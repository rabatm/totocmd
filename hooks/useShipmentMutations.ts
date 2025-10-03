import { useMutation } from '@tanstack/react-query';
import { CreateShipmentInput, UpdateShipmentStatusInput } from '@/src/types';
import { useInvalidateShipments } from './useShipments';
import { toast } from 'sonner';

export const useCreateShipment = () => {
  const { invalidateAll } = useInvalidateShipments();

  return useMutation({
    mutationFn: async (shipmentData: CreateShipmentInput) => {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shipmentData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'expédition');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la création de l\'expédition');
      }

      return data;
    },
    onSuccess: (data) => {
      invalidateAll();
      toast.success('Expédition créée avec succès');
    },
    onError: (error) => {
      console.error('Erreur création expédition:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de l\'expédition');
    },
  });
};

export const useUpdateShipmentStatus = () => {
  const { invalidateAll } = useInvalidateShipments();

  return useMutation({
    mutationFn: async ({
      shipmentId,
      statusData
    }: {
      shipmentId: string | number;
      statusData: UpdateShipmentStatusInput
    }) => {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du statut');
      }

      return data;
    },
    onSuccess: (data, { statusData }) => {
      invalidateAll();

      // Messages personnalisés selon le statut
      const statusMessages = {
        'brouillon': 'Expédition remise en brouillon',
        'En préparation': 'Expédition mise en préparation',
        'preparee': 'Préparation terminée',
        'verifiee': 'Expédition vérifiée',
        'expediee': 'Expédition finalisée et produits marqués comme expédiés',
        'En transit': 'Expédition en transit',
        'livree': 'Expédition livrée'
      };

      toast.success(statusMessages[statusData.statut] || 'Statut mis à jour');
    },
    onError: (error) => {
      console.error('Erreur mise à jour statut expédition:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
    },
  });
};

export const useDeleteShipment = () => {
  const { invalidateAll } = useInvalidateShipments();

  return useMutation({
    mutationFn: async (shipmentId: string | number) => {
      const response = await fetch(`/api/shipments/${shipmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'expédition');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression de l\'expédition');
      }

      return data;
    },
    onSuccess: () => {
      invalidateAll();
      toast.success('Expédition supprimée avec succès');
    },
    onError: (error) => {
      console.error('Erreur suppression expédition:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'expédition');
    },
  });
};

// Hook pour l'ajout de produits à une expédition
export const useAddProductToShipment = () => {
  const { invalidateShipment, invalidateList } = useInvalidateShipments();

  return useMutation({
    mutationFn: async ({
      shipmentId,
      productData
    }: {
      shipmentId: string | number;
      productData: {
        commande_produit_id: string;
        quantite_expediee: number;
        prix_unitaire_ht: number;
        prix_unitaire_ttc: number;
      };
    }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/produits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du produit');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'ajout du produit');
      }

      return data;
    },
    onSuccess: (data, { shipmentId }) => {
      invalidateShipment(shipmentId);
      invalidateList();
      toast.success('Produit ajouté à l\'expédition');
    },
    onError: (error) => {
      console.error('Erreur ajout produit à expédition:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'ajout du produit');
    },
  });
};

// Hook pour la mise à jour des quantités de produits
export const useUpdateShipmentProducts = () => {
  const { invalidateShipment, invalidateList } = useInvalidateShipments();

  return useMutation({
    mutationFn: async ({
      shipmentId,
      produits
    }: {
      shipmentId: string | number;
      produits: Array<{
        id: string;
        quantite_expediee: number;
      }>;
    }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/produits`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produits }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des quantités');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour des quantités');
      }

      return data;
    },
    onSuccess: (data, { shipmentId }) => {
      invalidateShipment(shipmentId);
      invalidateList();
      toast.success('Quantités mises à jour');
    },
    onError: (error) => {
      console.error('Erreur mise à jour quantités:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour des quantités');
    },
  });
};