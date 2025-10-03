import { useState } from 'react';
import { useUpdateShipmentStatus } from './useShipmentMutations';
import { ShipmentStatus, ShipmentWithDetails } from '@/src/types';
import { toast } from 'sonner';

export const useShipmentWorkflow = (shipment: ShipmentWithDetails) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const updateStatusMutation = useUpdateShipmentStatus();

  const canTransitionTo = (newStatus: ShipmentStatus): boolean => {
    const currentStatus = shipment.statut;

    // Règles de transition des statuts
    const validTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
      'brouillon': ['En préparation'],
      'En préparation': ['brouillon', 'preparee'],
      'preparee': ['En préparation', 'verifiee'],
      'verifiee': ['preparee', 'expediee'],
      'expediee': ['En transit'],
      'En transit': ['livree'],
      'livree': [] // État final
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  };

  const startPreparation = async (preparateur?: string) => {
    if (!canTransitionTo('En préparation')) {
      toast.error('Transition impossible vers la préparation');
      return false;
    }

    setIsProcessing(true);
    try {
      await updateStatusMutation.mutateAsync({
        shipmentId: shipment.id,
        statusData: {
          statut: 'En préparation',
          observations: preparateur ? `Préparation démarrée par ${preparateur}` : undefined
        }
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const completePreparation = async (observations?: string) => {
    if (!canTransitionTo('preparee')) {
      toast.error('Transition impossible vers l\'état préparée');
      return false;
    }

    setIsProcessing(true);
    try {
      await updateStatusMutation.mutateAsync({
        shipmentId: shipment.id,
        statusData: {
          statut: 'preparee',
          date_preparation: new Date().toISOString(),
          observations
        }
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const startVerification = async (verificateur?: string) => {
    if (shipment.statut !== 'preparee') {
      toast.error('La préparation doit être terminée avant la vérification');
      return false;
    }

    // La vérification ne change pas le statut, juste pour information
    toast.info(`Vérification démarrée${verificateur ? ` par ${verificateur}` : ''}`);
    return true;
  };

  const completeVerification = async (observations?: string, approved: boolean = true) => {
    if (!canTransitionTo('verifiee')) {
      toast.error('Transition impossible vers l\'état vérifiée');
      return false;
    }

    if (!approved) {
      // Retour en préparation si la vérification échoue
      return returnToPreparation(`Vérification échouée: ${observations || 'Problème détecté'}`);
    }

    setIsProcessing(true);
    try {
      await updateStatusMutation.mutateAsync({
        shipmentId: shipment.id,
        statusData: {
          statut: 'verifiee',
          date_verification: new Date().toISOString(),
          observations
        }
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeShipment = async (data: {
    numero_facture: string;
    numero_suivi_chronopost: string;
    transporteur?: string;
    observations?: string;
  } | string, observations?: string) => {
    if (!canTransitionTo('expediee')) {
      toast.error('Transition impossible vers l\'état expédiée');
      return false;
    }

    setIsProcessing(true);
    try {
      // Gestion de l'ancien format (string) pour rétrocompatibilité
      const isLegacyFormat = typeof data === 'string';
      const finalData = isLegacyFormat ? {
        numero_facture: '',
        numero_suivi_chronopost: data,
        observations
      } : data;

      // Mise à jour du shipment avec toutes les informations
      const response = await fetch(`/api/shipments/${shipment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statut: 'expediee',
          numero_facture: finalData.numero_facture,
          suivi_chronopost: finalData.numero_suivi_chronopost,
          transporteur: finalData.transporteur,
          observations: finalData.observations || `Expédition finalisée - FA: ${finalData.numero_facture}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation');
      }

      toast.success('Expédition finalisée avec succès');
      return true;
    } catch (error) {
      toast.error('Erreur lors de la finalisation');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const markInTransit = async (trackingNumber?: string) => {
    if (!canTransitionTo('En transit')) {
      toast.error('L\'expédition doit être finalisée avant d\'être en transit');
      return false;
    }

    setIsProcessing(true);
    try {
      await updateStatusMutation.mutateAsync({
        shipmentId: shipment.id,
        statusData: {
          statut: 'En transit',
          observations: `En transit${trackingNumber ? ` - Suivi: ${trackingNumber}` : ''}`
        }
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const markDelivered = async (deliveryDate?: string, observations?: string) => {
    if (!canTransitionTo('livree')) {
      toast.error('L\'expédition doit être en transit avant d\'être livrée');
      return false;
    }

    setIsProcessing(true);
    try {
      await updateStatusMutation.mutateAsync({
        shipmentId: shipment.id,
        statusData: {
          statut: 'livree',
          observations: observations || `Livraison confirmée${deliveryDate ? ` le ${deliveryDate}` : ''}`
        }
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const returnToPreparation = async (reason: string) => {
    if (!canTransitionTo('En préparation')) {
      toast.error('Impossible de retourner en préparation');
      return false;
    }

    setIsProcessing(true);
    try {
      await updateStatusMutation.mutateAsync({
        shipmentId: shipment.id,
        statusData: {
          statut: 'En préparation',
          observations: `Retour en préparation: ${reason}`
        }
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const getNextActions = (): Array<{
    key: string;
    label: string;
    action: () => Promise<boolean>;
    variant?: 'default' | 'destructive' | 'secondary';
    disabled?: boolean;
  }> => {
    const actions = [];
    const currentStatus = shipment.statut;

    switch (currentStatus) {
      case 'brouillon':
        actions.push({
          key: 'start-preparation',
          label: 'Démarrer la préparation',
          action: startPreparation
        });
        break;

      case 'En préparation':
        actions.push(
          {
            key: 'complete-preparation',
            label: 'Terminer la préparation',
            action: completePreparation
          },
          {
            key: 'return-draft',
            label: 'Retour en brouillon',
            action: () => returnToPreparation('Retour en brouillon demandé'),
            variant: 'secondary' as const
          }
        );
        break;

      case 'preparee':
        actions.push(
          {
            key: 'complete-verification',
            label: 'Valider la vérification',
            action: completeVerification
          },
          {
            key: 'return-preparation',
            label: 'Retour en préparation',
            action: () => returnToPreparation('Retour en préparation demandé'),
            variant: 'secondary' as const
          }
        );
        break;

      case 'verifiee':
        actions.push(
          {
            key: 'finalize',
            label: 'Finaliser l\'expédition',
            action: finalizeShipment
          },
          {
            key: 'return-preparation',
            label: 'Retour en préparation',
            action: () => returnToPreparation('Retour en préparation demandé'),
            variant: 'secondary' as const
          }
        );
        break;

      case 'expediee':
        actions.push({
          key: 'mark-transit',
          label: 'Marquer en transit',
          action: markInTransit,
          variant: 'secondary' as const
        });
        break;

      case 'En transit':
        actions.push({
          key: 'mark-delivered',
          label: 'Marquer comme livrée',
          action: markDelivered,
          variant: 'secondary' as const
        });
        break;

      case 'livree':
        // État final, aucune action
        break;
    }

    return actions.map(action => ({
      ...action,
      disabled: isProcessing
    }));
  };

  return {
    canTransitionTo,
    startPreparation,
    completePreparation,
    startVerification,
    completeVerification,
    finalizeShipment,
    markInTransit,
    markDelivered,
    returnToPreparation,
    getNextActions,
    isProcessing
  };
};