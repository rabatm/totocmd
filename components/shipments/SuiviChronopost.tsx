'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Truck,
  ExternalLink,
  Package,
  Clock,
  CheckCircle2,
  Plus,
  Edit3,
  AlertCircle,
  Hash,
  Calendar,
  Eye,
  Navigation
} from 'lucide-react'
import { useColisWithTracking, useUpdateSuiviChronopost } from '@/hooks/useShipmentColis'
import { ShipmentColis, ColisStatus } from '@/src/types'
import { ColisStatusLabels, ColisStatusColors } from '@/src/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import ChronopostTracker from './ChronopostTracker'

interface SuiviChronopostProps {
  shipmentId: number
  canEdit?: boolean
  className?: string
}

interface TrackingDialogState {
  colisId: string
  currentTracking: string
}

export default function SuiviChronopost({
  shipmentId,
  canEdit = true,
  className
}: SuiviChronopostProps) {
  const { data: colis = [], isLoading, error } = useColisWithTracking(shipmentId)
  const updateSuivi = useUpdateSuiviChronopost()

  const [trackingDialog, setTrackingDialog] = useState<TrackingDialogState | null>(null)
  const [newTracking, setNewTracking] = useState('')

  // Statistiques du tracking
  const totalColis = colis.length
  const withTracking = colis.filter(c => c.hasTracking).length
  const missingTracking = totalColis - withTracking
  const progressPercentage = totalColis > 0 ? (withTracking / totalColis) * 100 : 0

  // Ouvrir le dialog de modification/ajout de suivi
  const openTrackingDialog = (colisItem: any) => {
    setTrackingDialog({
      colisId: colisItem.id,
      currentTracking: colisItem.numero_suivi_chronopost || ''
    })
    setNewTracking(colisItem.numero_suivi_chronopost || '')
  }

  // Sauvegarder le numéro de suivi
  const handleSaveTracking = async () => {
    if (!trackingDialog) return

    try {
      if (!newTracking.trim()) {
        toast.error('Le numéro de suivi est requis')
        return
      }

      // Validation format (basique)
      const trackingRegex = /^[A-Z0-9]{10,20}$/
      if (!trackingRegex.test(newTracking.trim())) {
        toast.error('Format de numéro de suivi invalide (10-20 caractères alphanumériques)')
        return
      }

      await updateSuivi.mutateAsync({
        shipmentId,
        colisId: trackingDialog.colisId,
        numero_suivi_chronopost: newTracking.trim()
      })

      setTrackingDialog(null)
      setNewTracking('')
      toast.success('Numéro de suivi mis à jour avec succès')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
  }

  // Fermer le dialog
  const closeTrackingDialog = () => {
    setTrackingDialog(null)
    setNewTracking('')
  }

  // Icône selon le statut du colis
  const getStatusIcon = (status: ColisStatus) => {
    switch (status) {
      case 'prepare': return <Package className="h-4 w-4" />
      case 'expedie': return <Truck className="h-4 w-4" />
      case 'en_transit': return <Clock className="h-4 w-4 animate-pulse" />
      case 'livre': return <CheckCircle2 className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  // État global du tracking
  const getGlobalTrackingStatus = () => {
    if (totalColis === 0) return { status: 'empty', color: 'gray', text: 'Aucun colis' }
    if (progressPercentage === 100) return { status: 'complete', color: 'green', text: 'Tous les colis suivis' }
    if (progressPercentage === 0) return { status: 'none', color: 'red', text: 'Aucun suivi configuré' }
    return { status: 'partial', color: 'orange', text: `${withTracking}/${totalColis} colis suivis` }
  }

  const globalStatus = getGlobalTrackingStatus()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement du suivi...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Erreur lors du chargement du suivi</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Suivi Chronopost Multi-Colis
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                globalStatus.color === 'green' && "bg-green-100 text-green-700",
                globalStatus.color === 'orange' && "bg-orange-100 text-orange-700",
                globalStatus.color === 'red' && "bg-red-100 text-red-700",
                globalStatus.color === 'gray' && "bg-gray-100 text-gray-700"
              )}
            >
              {globalStatus.text}
            </Badge>
          </CardTitle>

          {/* Barre de progression globale */}
          {totalColis > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progression du suivi</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress
                value={progressPercentage}
                className="h-2"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {totalColis === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Aucun colis</p>
              <p className="text-sm">Les colis apparaîtront ici une fois créés</p>
            </div>
          ) : (
            <div className="space-y-3">
              {colis.map((colisItem) => (
                <div
                  key={colisItem.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Info colis */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 shrink-0"
                    >
                      <Hash className="h-3 w-3" />
                      {colisItem.numero_colis}
                    </Badge>

                    <div className="min-w-0 flex-1">
                      {colisItem.hasTracking ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm font-mono">
                              {colisItem.numero_suivi_chronopost}
                            </code>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "flex items-center gap-1 text-xs",
                                `bg-${ColisStatusColors[colisItem.statut_colis]}-100 text-${ColisStatusColors[colisItem.statut_colis]}-700`
                              )}
                            >
                              {getStatusIcon(colisItem.statut_colis)}
                              {ColisStatusLabels[colisItem.statut_colis]}
                            </Badge>
                          </div>

                          {/* Dates importantes */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {colisItem.date_expedition && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Exp: {new Date(colisItem.date_expedition).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                            {colisItem.date_livraison && (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Livré: {new Date(colisItem.date_livraison).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Aucun numéro de suivi</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {colisItem.hasTracking && colisItem.trackingUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(colisItem.trackingUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Site Web
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm">
                              <Navigation className="h-4 w-4 mr-1" />
                              Suivi Live
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Package className="h-5 w-5" />
                                <span>Suivi en temps réel - Colis #{colisItem.numero_colis}</span>
                              </DialogTitle>
                              <DialogDescription>
                                Numéro de suivi: {colisItem.numero_suivi_chronopost}
                              </DialogDescription>
                            </DialogHeader>
                            <ChronopostTracker
                              trackingNumber={colisItem.numero_suivi_chronopost}
                              className="border-none shadow-none"
                            />
                          </DialogContent>
                        </Dialog>
                      </>
                    )}

                    {canEdit && (
                      <Button
                        variant={colisItem.hasTracking ? "outline" : "default"}
                        size="sm"
                        onClick={() => openTrackingDialog(colisItem)}
                      >
                        {colisItem.hasTracking ? (
                          <Edit3 className="h-4 w-4" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Résumé final */}
          {totalColis > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">
                    État du suivi multi-colis
                  </h4>
                  <p className="text-sm text-gray-600">
                    {globalStatus.status === 'complete' && "🎉 Parfait ! Tous les colis peuvent être suivis."}
                    {globalStatus.status === 'partial' && `⏳ ${missingTracking} colis en attente de numéro de suivi.`}
                    {globalStatus.status === 'none' && "⚠️ Aucun colis n'a de numéro de suivi configuré."}
                    {globalStatus.status === 'empty' && "📦 Commencez par créer des colis pour cette expédition."}
                  </p>
                </div>

                {globalStatus.status === 'complete' && (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                )}
                {globalStatus.status === 'partial' && (
                  <Clock className="h-8 w-8 text-orange-600" />
                )}
                {globalStatus.status === 'none' && (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout/modification du suivi */}
      <Dialog open={!!trackingDialog} onOpenChange={(open) => !open && closeTrackingDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {trackingDialog?.currentTracking ? 'Modifier' : 'Ajouter'} le numéro de suivi Chronopost
            </DialogTitle>
            <DialogDescription>
              Saisissez le numéro de suivi Chronopost pour ce colis.
              Format attendu: 10-20 caractères alphanumériques.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking_number">
                Numéro de suivi Chronopost *
              </Label>
              <Input
                id="tracking_number"
                placeholder="Ex: 1234567890123"
                value={newTracking}
                onChange={(e) => setNewTracking(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Le numéro sera automatiquement converti en majuscules
              </p>
            </div>

            {/* Aperçu URL */}
            {newTracking.trim() && (
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600 mb-1">Aperçu du lien de suivi:</p>
                <p className="text-xs font-mono text-blue-600 break-all">
                  https://www.chronopost.fr/tracking-colis?listeNumerosLT={newTracking.trim()}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeTrackingDialog}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveTracking}
              disabled={updateSuivi.isPending}
            >
              {updateSuivi.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {trackingDialog?.currentTracking ? 'Modifier' : 'Ajouter'} le suivi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}