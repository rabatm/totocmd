import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Personnel, PersonnelAssignment } from '@/src/types'

// Hook pour récupérer tout le personnel
export const usePersonnel = () => {
  return useQuery({
    queryKey: ['personnel'],
    queryFn: async (): Promise<{ data: Personnel[] }> => {
      const response = await fetch('/api/personnel')

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du personnel')
      }

      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - le personnel change rarement
  })
}

// Hook pour récupérer un membre du personnel spécifique
export const usePersonnelMember = (personnelId: number | null) => {
  return useQuery({
    queryKey: ['personnel', personnelId],
    queryFn: async (): Promise<{ data: Personnel }> => {
      if (!personnelId) throw new Error('ID personnel requis')

      const response = await fetch(`/api/personnel/${personnelId}`)

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du membre du personnel')
      }

      return response.json()
    },
    enabled: !!personnelId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook pour récupérer le personnel actif (non archivé si applicable)
export const useActivePersonnel = () => {
  return useQuery({
    queryKey: ['personnel', 'active'],
    queryFn: async (): Promise<{ data: Personnel[] }> => {
      const response = await fetch('/api/personnel?active=true')

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du personnel actif')
      }

      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook pour assigner du personnel à une expédition
export const usePersonnelAssignment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      shipmentId,
      ...assignment
    }: PersonnelAssignment & { shipmentId: number }) => {
      const response = await fetch(`/api/shipments/${shipmentId}/personnel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'assignation du personnel')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes liées
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

// Hook pour récupérer les statistiques d'activité du personnel
export const usePersonnelStats = () => {
  return useQuery({
    queryKey: ['personnel-stats'],
    queryFn: async () => {
      const response = await fetch('/api/personnel/stats')

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques du personnel')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook pour récupérer les expéditions assignées à un membre du personnel
export const usePersonnelShipments = (personnelId: number | null, role: 'preparateur' | 'verificateur') => {
  return useQuery({
    queryKey: ['personnel-shipments', personnelId, role],
    queryFn: async () => {
      if (!personnelId) throw new Error('ID personnel requis')

      const paramName = role === 'preparateur' ? 'preparateur_id' : 'verificateur_id'
      const response = await fetch(`/api/shipments?${paramName}=${personnelId}`)

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des expéditions')
      }

      return response.json()
    },
    enabled: !!personnelId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook pour valider qu'un préparateur et vérificateur sont différents
export const useValidatePersonnelAssignment = () => {
  return {
    validateAssignment: (preparateurId?: string, verificateurId?: string) => {
      const errors: string[] = []

      if (!preparateurId) {
        errors.push('Un préparateur doit être sélectionné')
      }

      if (verificateurId && preparateurId === verificateurId) {
        errors.push('Le vérificateur doit être différent du préparateur')
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    }
  }
}

// Hook utilitaire pour la sélection de personnel avec double-clic
export const usePersonnelSelector = () => {
  const { data: personnelData } = useActivePersonnel()
  const personnel = personnelData?.data || []

  return {
    personnel,
    getPersonnelById: (id: string) => personnel.find(p => p.id.toString() === id),
    getPersonnelByIds: (preparateurId?: string, verificateurId?: string) => {
      const preparateur = preparateurId ? personnel.find(p => p.id.toString() === preparateurId) : undefined
      const verificateur = verificateurId ? personnel.find(p => p.id.toString() === verificateurId) : undefined

      return { preparateur, verificateur }
    }
  }
}

// Hook pour gérer l'état de sélection du personnel (pour le composant PersonnelSelector)
export const usePersonnelSelection = () => {
  const [preparateurId, setPreparateurId] = useState<string | undefined>()
  const [verificateurId, setVerificateurId] = useState<string | undefined>()
  const { validateAssignment } = useValidatePersonnelAssignment()

  const handlePersonnelClick = (personnelId: string) => {
    if (!preparateurId) {
      // Premier clic -> assigner comme préparateur
      setPreparateurId(personnelId)
    } else if (preparateurId === personnelId && !verificateurId) {
      // Deuxième clic sur le même -> assigner comme vérificateur
      setVerificateurId(personnelId)
      setPreparateurId(undefined) // Libérer le préparateur
    } else if (!verificateurId) {
      // Clic sur quelqu'un d'autre -> assigner comme vérificateur
      setVerificateurId(personnelId)
    } else {
      // Reset complet
      setPreparateurId(personnelId)
      setVerificateurId(undefined)
    }
  }

  const reset = () => {
    setPreparateurId(undefined)
    setVerificateurId(undefined)
  }

  const validation = validateAssignment(preparateurId, verificateurId)

  return {
    preparateurId,
    verificateurId,
    handlePersonnelClick,
    reset,
    validation,
    hasSelection: !!preparateurId || !!verificateurId
  }
}

