import { useQuery } from '@tanstack/react-query'
import { ChronopostTrackingInfo } from '@/lib/chronopost-api'

/**
 * Hook pour récupérer les informations de suivi Chronopost
 */
export const useChronopostTracking = (trackingNumber: string | null | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['chronopost-tracking', trackingNumber],
    queryFn: async (): Promise<ChronopostTrackingInfo> => {
      if (!trackingNumber) {
        throw new Error('Numéro de suivi requis')
      }

      const response = await fetch(`/api/chronopost/tracking/${trackingNumber}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération du suivi')
      }

      const data = await response.json()
      return data.data
    },
    enabled: !!trackingNumber && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch toutes les 30 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook pour récupérer plusieurs trackings en parallèle
 */
export const useMultipleChronopostTracking = (trackingNumbers: string[]) => {
  const queries = trackingNumbers.map(trackingNumber => ({
    queryKey: ['chronopost-tracking', trackingNumber],
    queryFn: async (): Promise<ChronopostTrackingInfo> => {
      const response = await fetch(`/api/chronopost/tracking/${trackingNumber}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération du suivi')
      }

      const data = await response.json()
      return data.data
    },
    enabled: !!trackingNumber,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  }))

  return queries
}

/**
 * Hook pour vérifier si un colis est livré
 */
export const useIsDelivered = (trackingNumber: string | null | undefined) => {
  const { data: trackingInfo } = useChronopostTracking(trackingNumber)
  return trackingInfo?.isDelivered || false
}

/**
 * Hook pour obtenir le statut actuel
 */
export const useCurrentStatus = (trackingNumber: string | null | undefined) => {
  const { data: trackingInfo } = useChronopostTracking(trackingNumber)
  return {
    status: trackingInfo?.status || 'unknown',
    description: trackingInfo?.statusDescription || 'Statut inconnu',
    location: trackingInfo?.currentLocation
  }
}