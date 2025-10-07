'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Truck,
  Package,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Hash,
  Plus,
  Edit3,
  Send,
  Clock
} from 'lucide-react'
import { useShipment, useUpdateShipmentStatus } from '@/hooks/useShipments'
import { useColisWithTracking, useUpdateSuiviChronopost } from '@/hooks/useShipmentColis'
import { ShipmentStatus, ColisStatus } from '@/src/types'
import { ColisStatusLabels, ColisStatusColors } from '@/src/types'
import SuiviChronopost from './SuiviChronopost'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ExpeditionInterfaceProps {
  shipmentId: number
  className?: string
}

interface ExpeditionData {
  date_expedition: string
  transporteur: string
  notes_expedition?: string
  confirmation_envoi: boolean
}

interface TrackingDialogState {
  colisId: string
  currentTracking: string
  colisNumber: number
}

export default function ExpeditionInterface({
  shipmentId,
  className
}: ExpeditionInterfaceProps) {
  const { data: shipmentResponse, isLoading: shipmentLoading } = useShipment(shipmentId)
  const shipment = shipmentResponse?.data
  const { data: colis = [], isLoading: colisLoading } = useColisWithTracking(shipmentId)
  const updateStatus = useUpdateShipmentStatus()
  const updateSuivi = useUpdateSuiviChronopost()

  const [expeditionData, setExpeditionData] = useState<ExpeditionData>({
    date_expedition: new Date().toISOString().split('T')[0],
    transporteur: 'Chronopost',
    confirmation_envoi: false
  })

  const [trackingDialog, setTrackingDialog] = useState<TrackingDialogState | null>(null)
  const [newTracking, setNewTracking] = useState('')
  const [showExpeditionDialog, setShowExpeditionDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('tracking')

  // Statistiques du tracking
  const totalColis = colis.length
  const withTracking = colis.filter(c => c.hasTracking).length
  const missingTracking = totalColis - withTracking
  const progressPercentage = totalColis > 0 ? (withTracking / totalColis) * 100 : 0
  const canExpedite = totalColis > 0 && withTracking === totalColis

  // Ouvrir le dialog de tracking
  const openTrackingDialog = (colisItem: { id: string; numero_suivi_chronopost?: string; numero_colis: number }) => {
    setTrackingDialog({
      colisId: colisItem.id,
      currentTracking: colisItem.numero_suivi_chronopost || '',
      colisNumber: colisItem.numero_colis
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

  // Fermer le dialog de tracking
  const closeTrackingDialog = () => {
    setTrackingDialog(null)
    setNewTracking('')
  }

  // Finaliser l&apos;expédition
  const handleFinalizeExpedition = async () => {
    try {
      if (!canExpedite) {
        toast.error('Tous les colis doivent avoir un numéro de suivi avant l\'expédition')
        return
      }

      if (!expeditionData.confirmation_envoi) {
        toast.error('Veuillez confirmer l\'envoi avant de finaliser')
        return
      }

      await updateStatus.mutateAsync({
        shipmentId,
        statut: 'expediee' as ShipmentStatus,
        observations: expeditionData.notes_expedition
      })

      setShowExpeditionDialog(false)
      toast.success('Expédition finalisée avec succès')
    } catch {
      toast.error('Erreur lors de la finalisation de l\'expédition')
    }
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

  if (shipmentLoading || colisLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement de l&apos;expédition...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête avec informations de l&apos;expédition */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Expédition #{shipmentId}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                {shipment?.verificateur && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Vérifié par: {shipment?.verificateur}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={cn(
                    canExpedite ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}
                >
                  {withTracking}/{totalColis} colis tracés
                </Badge>
                {missingTracking > 0 && (
                  <Badge variant="outline" className="text-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {missingTracking} sans tracking
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600">
                Tracking complet
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interface principale */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Suivi Multi-Colis</TabsTrigger>
          <TabsTrigger value="management">Gestion Rapide</TabsTrigger>
          <TabsTrigger value="expedition">Expédition</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <SuiviChronopost
            shipmentId={shipmentId}
            canEdit={shipment?.statut !== 'expediee'}
          />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Gestion Rapide des Numéros de Suivi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {colis.map((colisItem) => (
                  <div
                    key={colisItem.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                      <Hash className="h-3 w-3" />
                      Colis #{colisItem.numero_colis}
                    </Badge>

                    <div className="flex-1 min-w-0">
                      {colisItem.hasTracking ? (
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
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Aucun numéro de suivi</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {colisItem.hasTracking && colisItem.trackingUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => colisItem.trackingUrl && window.open(colisItem.trackingUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Suivre
                        </Button>
                      )}

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
                    </div>
                  </div>
                ))}

                {totalColis === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">Aucun colis</p>
                    <p className="text-sm">Cette expédition ne contient aucun colis</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expedition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Finalisation de l&apos;Expédition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* État du tracking */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">
                      État du tracking multi-colis
                    </h4>
                    <p className="text-sm text-gray-600">
                      {canExpedite
                        ? "🎉 Parfait ! Tous les colis peuvent être suivis et l&apos;expédition est prête."
                        : `⚠️ ${missingTracking} colis en attente de numéro de suivi.`
                      }
                    </p>
                  </div>

                  {canExpedite ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  )}
                </div>
              </div>

              {/* Résumé des colis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalColis}</div>
                    <div className="text-sm text-gray-600">Colis total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{withTracking}</div>
                    <div className="text-sm text-gray-600">Avec tracking</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{missingTracking}</div>
                    <div className="text-sm text-gray-600">Sans tracking</div>
                  </CardContent>
                </Card>
              </div>

              {/* Action d'expédition */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">Prêt pour l&apos;expédition</h3>
                  <p className="text-sm text-gray-600">
                    {canExpedite
                      ? "Tous les colis ont un numéro de suivi. Vous pouvez finaliser l&apos;expédition."
                      : "Veuillez ajouter les numéros de suivi manquants avant de continuer."
                    }
                  </p>
                </div>

                <Button
                  onClick={() => setShowExpeditionDialog(true)}
                  disabled={!canExpedite}
                  className={cn(
                    "min-w-32",
                    canExpedite ? "bg-green-600 hover:bg-green-700" : ""
                  )}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {canExpedite ? "Finaliser l&apos;expédition" : "Tracking incomplet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'ajout/modification du tracking */}
      <Dialog open={!!trackingDialog} onOpenChange={(open) => !open && closeTrackingDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {trackingDialog?.currentTracking ? 'Modifier' : 'Ajouter'} le tracking - Colis #{trackingDialog?.colisNumber}
            </DialogTitle>
            <DialogDescription>
              Saisissez le numéro de suivi Chronopost pour ce colis.
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
                Format: 10-20 caractères alphanumériques (converti automatiquement en majuscules)
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
              {trackingDialog?.currentTracking ? 'Modifier' : 'Ajouter'} le tracking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de finalisation d'expédition */}
      <Dialog open={showExpeditionDialog} onOpenChange={setShowExpeditionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Finaliser l&apos;Expédition #{shipmentId}
            </DialogTitle>
            <DialogDescription>
              Confirmez les détails d&apos;expédition avant de finaliser l&apos;envoi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_expedition">Date d&apos;expédition *</Label>
                <Input
                  id="date_expedition"
                  type="date"
                  value={expeditionData.date_expedition}
                  onChange={(e) => setExpeditionData(prev => ({
                    ...prev,
                    date_expedition: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transporteur">Transporteur *</Label>
                <Input
                  id="transporteur"
                  value={expeditionData.transporteur}
                  onChange={(e) => setExpeditionData(prev => ({
                    ...prev,
                    transporteur: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes_expedition">Notes d&apos;expédition</Label>
              <Textarea
                id="notes_expedition"
                placeholder="Notes additionnelles (optionnel)..."
                value={expeditionData.notes_expedition || ''}
                onChange={(e) => setExpeditionData(prev => ({
                  ...prev,
                  notes_expedition: e.target.value
                }))}
              />
            </div>

            {/* Récapitulatif */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Récapitulatif de l&apos;expédition</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Colis total:</span>
                  <span className="font-medium ml-2">{totalColis}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avec tracking:</span>
                  <span className="font-medium ml-2 text-green-600">{withTracking}</span>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmation_envoi"
                checked={expeditionData.confirmation_envoi}
                onChange={(e) => setExpeditionData(prev => ({
                  ...prev,
                  confirmation_envoi: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="confirmation_envoi" className="text-sm">
                Je confirme que tous les colis sont prêts pour l&apos;expédition
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExpeditionDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleFinalizeExpedition}
              disabled={!expeditionData.confirmation_envoi || updateStatus.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateStatus.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              <Send className="h-4 w-4 mr-2" />
              Finaliser l&apos;expédition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}