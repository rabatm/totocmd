'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Package,
  Truck,
  ExternalLink,
  Edit3,
  Save,
  X,
  Weight,
  Ruler,
  Hash,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { ShipmentColis, ColisStatus } from '@/src/types'
import { useUpdateColis, useUpdateSuiviChronopost } from '@/hooks/useShipmentColis'
import { ColisStatusLabels, ColisStatusColors } from '@/src/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ColisCardProps {
  colis: ShipmentColis
  shipmentId: number
  onDelete?: () => void
  canEdit?: boolean
  className?: string
}

export default function ColisCard({
  colis,
  shipmentId,
  onDelete,
  canEdit = true,
  className
}: ColisCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    numero_suivi_chronopost: colis.numero_suivi_chronopost || '',
    poids_grammes: colis.poids_grammes?.toString() || '',
    dimensions_cm: colis.dimensions_cm || '',
    statut_colis: colis.statut_colis
  })

  const updateColis = useUpdateColis()
  const updateSuivi = useUpdateSuiviChronopost()

  // Gestion de la sauvegarde
  const handleSave = async () => {
    try {
      const updates: any = {}

      // Vérifier les changements
      if (editData.poids_grammes !== (colis.poids_grammes?.toString() || '')) {
        updates.poids_grammes = editData.poids_grammes ? parseInt(editData.poids_grammes) : null
      }
      if (editData.dimensions_cm !== (colis.dimensions_cm || '')) {
        updates.dimensions_cm = editData.dimensions_cm || null
      }
      if (editData.statut_colis !== colis.statut_colis) {
        updates.statut_colis = editData.statut_colis
      }

      // Mise à jour du colis si nécessaire
      if (Object.keys(updates).length > 0) {
        await updateColis.mutateAsync({
          shipmentId,
          colisId: colis.id,
          ...updates
        })
      }

      // Mise à jour du suivi séparément si nécessaire
      if (editData.numero_suivi_chronopost !== (colis.numero_suivi_chronopost || '')) {
        if (editData.numero_suivi_chronopost.trim()) {
          await updateSuivi.mutateAsync({
            shipmentId,
            colisId: colis.id,
            numero_suivi_chronopost: editData.numero_suivi_chronopost.trim()
          })
        }
      }

      setIsEditing(false)
      toast.success('Colis mis à jour avec succès')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  // Annulation des modifications
  const handleCancel = () => {
    setEditData({
      numero_suivi_chronopost: colis.numero_suivi_chronopost || '',
      poids_grammes: colis.poids_grammes?.toString() || '',
      dimensions_cm: colis.dimensions_cm || '',
      statut_colis: colis.statut_colis
    })
    setIsEditing(false)
  }

  // URL de tracking Chronopost
  const trackingUrl = colis.numero_suivi_chronopost
    ? `https://www.chronopost.fr/tracking-colis?listeNumerosLT=${colis.numero_suivi_chronopost}`
    : null

  // Icône selon le statut
  const getStatusIcon = (status: ColisStatus) => {
    switch (status) {
      case 'prepare': return <Package className="h-4 w-4" />
      case 'expedie': return <Truck className="h-4 w-4" />
      case 'en_transit': return <Clock className="h-4 w-4" />
      case 'livre': return <CheckCircle2 className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const isLoading = updateColis.isPending || updateSuivi.isPending

  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Colis #{colis.numero_colis}
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Statut du colis */}
            <Badge
              variant="secondary"
              className={cn(
                "flex items-center gap-1",
                `bg-${ColisStatusColors[colis.statut_colis]}-100 text-${ColisStatusColors[colis.statut_colis]}-700`
              )}
            >
              {getStatusIcon(colis.statut_colis)}
              {ColisStatusLabels[colis.statut_colis]}
            </Badge>

            {/* Actions */}
            {canEdit && (
              <div className="flex items-center gap-1">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Numéro de suivi Chronopost */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Truck className="h-4 w-4" />
            Numéro de suivi Chronopost
          </Label>

          {isEditing ? (
            <div className="space-y-2">
              <Input
                placeholder="Ex: 1234567890123"
                value={editData.numero_suivi_chronopost}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  numero_suivi_chronopost: e.target.value
                }))}
              />
              <p className="text-xs text-gray-500">
                Format attendu: 10-20 caractères alphanumériques
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {colis.numero_suivi_chronopost ? (
                <>
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                    {colis.numero_suivi_chronopost}
                  </code>
                  {trackingUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(trackingUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Suivre
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Aucun numéro de suivi</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informations physiques */}
        <div className="grid grid-cols-2 gap-4">
          {/* Poids */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Weight className="h-4 w-4" />
              Poids (g)
            </Label>

            {isEditing ? (
              <Input
                type="number"
                placeholder="Ex: 1500"
                value={editData.poids_grammes}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  poids_grammes: e.target.value
                }))}
              />
            ) : (
              <div className="text-sm">
                {colis.poids_grammes ? (
                  <span className="font-medium">{colis.poids_grammes}g</span>
                ) : (
                  <span className="text-gray-400">Non renseigné</span>
                )}
              </div>
            )}
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4" />
              Dimensions (cm)
            </Label>

            {isEditing ? (
              <Input
                placeholder="Ex: 30x20x15"
                value={editData.dimensions_cm}
                onChange={(e) => setEditData(prev => ({
                  ...prev,
                  dimensions_cm: e.target.value
                }))}
              />
            ) : (
              <div className="text-sm">
                {colis.dimensions_cm ? (
                  <span className="font-medium">{colis.dimensions_cm}</span>
                ) : (
                  <span className="text-gray-400">Non renseigné</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dates importantes */}
        <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 pt-2 border-t">
          {colis.date_expedition && (
            <div>Expédié le: {new Date(colis.date_expedition).toLocaleDateString('fr-FR')}</div>
          )}
          {colis.date_livraison && (
            <div>Livré le: {new Date(colis.date_livraison).toLocaleDateString('fr-FR')}</div>
          )}
          <div>Créé le: {new Date(colis.created_at || '').toLocaleDateString('fr-FR')}</div>
        </div>

        {/* Indicateur de loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}