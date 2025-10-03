import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShipmentColis, UpdateColisInput } from '@/src/types'

// Hook pour récupérer les colis d'une expédition
export const useShipmentColis = (shipmentId: number | null) => {
  return useQuery({
    queryKey: ['shipment-colis', shipmentId],
    queryFn: async (): Promise<{ data: ShipmentColis[]; total: number }> => {
      if (!shipmentId) throw new Error('ID expédition requis')

      const response = await fetch(`/api/shipments/${shipmentId}/colis`)

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des colis')
      }

      return response.json()
    },
    enabled: !!shipmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook pour récupérer un colis spécifique
export const useColis = (shipmentId: number | null, colisId: string | null) => {
  return useQuery({
    queryKey: ['colis', shipmentId, colisId],
    queryFn: async (): Promise<{ data: ShipmentColis }> => {
      if (!shipmentId || !colisId) throw new Error('IDs requis')

      const response = await fetch(`/api/shipments/${shipmentId}/colis/${colisId}`)

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du colis')
      }

      return response.json()
    },
    enabled: !!shipmentId && !!colisId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Hook pour créer un nouveau colis
export const useCreateColis = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shipmentId,
      ...colisData
    }: {
      shipmentId: number
      numero_colis: number
      poids_grammes?: number
      dimensions_cm?: string
    }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/colis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(colisData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création du colis')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalider les colis de l'expédition
      queryClient.invalidateQueries({ queryKey: ['shipment-colis', variables.shipmentId] })
      // Invalider l'expédition elle-même
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

// Hook pour mettre à jour un colis
export const useUpdateColis = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shipmentId,
      colisId,
      ...updateData
    }: {
      shipmentId: number
      colisId: string
    } & UpdateColisInput) => {
      const response = await fetch(`/api/shipments/${shipmentId}/colis/${colisId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la mise à jour du colis')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['shipment-colis', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['colis', variables.shipmentId, variables.colisId] })
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] })
    },
  })
}

// Hook pour mettre à jour le numéro de suivi d'un colis
export const useUpdateSuiviChronopost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shipmentId,
      colisId,
      numero_suivi_chronopost
    }: {
      shipmentId: number
      colisId: string
      numero_suivi_chronopost: string
    }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/colis/${colisId}/suivi`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numero_suivi_chronopost }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la mise à jour du suivi')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalider toutes les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['shipment-colis', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['colis', variables.shipmentId, variables.colisId] })
      queryClient.invalidateQueries({ queryKey: ['suivi', variables.shipmentId, variables.colisId] })
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

// Hook pour supprimer un colis
export const useDeleteColis = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shipmentId,
      colisId
    }: {
      shipmentId: number
      colisId: string
    }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/colis/${colisId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la suppression du colis')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['shipment-colis', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

// Hook pour récupérer les informations de suivi d'un colis
export const useSuiviChronopost = (shipmentId: number | null, colisId: string | null) => {
  return useQuery({
    queryKey: ['suivi', shipmentId, colisId],
    queryFn: async () => {
      if (!shipmentId || !colisId) throw new Error('IDs requis')

      const response = await fetch(`/api/shipments/${shipmentId}/colis/${colisId}/suivi`)

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du suivi')
      }

      return response.json()
    },
    enabled: !!shipmentId && !!colisId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch toutes les 10 minutes
  })
}

// Hook pour récupérer tous les colis avec leur statut de suivi
export const useColisWithTracking = (shipmentId: number | null) => {
  const { data: colisData, ...rest } = useShipmentColis(shipmentId)

  return {
    data: colisData?.data?.map(colis => ({
      ...colis,
      hasTracking: !!colis.numero_suivi_chronopost,
      trackingUrl: colis.numero_suivi_chronopost
        ? `https://www.chronopost.fr/tracking-colis?listeNumerosLT=${colis.numero_suivi_chronopost}`
        : null
    })),
    total: colisData?.total || 0,
    ...rest
  }
}

// Hook pour vérifier si tous les colis ont un numéro de suivi
export const useAllColisHaveTracking = (shipmentId: number | null) => {
  const { data: colisData } = useShipmentColis(shipmentId)

  const colis = colisData?.data || []
  const allHaveTracking = colis.length > 0 && colis.every(c => c.numero_suivi_chronopost)
  const trackingCount = colis.filter(c => c.numero_suivi_chronopost).length

  return {
    allHaveTracking,
    trackingCount,
    totalColis: colis.length,
    missingTracking: colis.length - trackingCount
  }
}

// Hook utilitaire pour les mutations de colis (création, mise à jour, suppression)
export const useColisMutations = () => {
  const createColis = useCreateColis()
  const updateColis = useUpdateColis()
  const deleteColis = useDeleteColis()
  const updateSuivi = useUpdateSuiviChronopost()

  return {
    createColis,
    updateColis,
    deleteColis,
    updateSuivi,
    isLoading: createColis.isPending || updateColis.isPending || deleteColis.isPending || updateSuivi.isPending
  }
}