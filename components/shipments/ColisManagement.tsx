'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Package,
  Plus,
  Trash2,
  Truck,
  AlertCircle,
  CheckCircle2,
  PackageX,
  Hash
} from 'lucide-react'
import { useShipmentColis, useColisMutations, useAllColisHaveTracking } from '@/hooks/useShipmentColis'
import { ShipmentColis } from '@/src/types'
import ColisCard from './ColisCard'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ColisManagementProps {
  shipmentId: number
  canEdit?: boolean
  className?: string
}

export default function ColisManagement({
  shipmentId,
  canEdit = true,
  className
}: ColisManagementProps) {
  const { data: colisData, isLoading, error } = useShipmentColis(shipmentId)
  const { allHaveTracking, trackingCount, totalColis, missingTracking } = useAllColisHaveTracking(shipmentId)
  const { createColis, deleteColis, isLoading: isMutating } = useColisMutations()

  // États pour les dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  // État pour le nouveau colis
  const [newColis, setNewColis] = useState({
    numero_colis: '',
    poids_grammes: '',
    dimensions_cm: ''
  })

  const colis = colisData?.data || []

  // Créer un nouveau colis
  const handleCreateColis = async () => {
    try {
      if (!newColis.numero_colis.trim()) {
        toast.error('Le numéro de colis est requis')
        return
      }

      // Vérifier l'unicité du numéro
      if (colis.some(c => c.numero_colis.toString() === newColis.numero_colis)) {
        toast.error('Ce numéro de colis existe déjà')
        return
      }

      await createColis.mutateAsync({
        shipmentId,
        numero_colis: parseInt(newColis.numero_colis),
        poids_grammes: newColis.poids_grammes ? parseInt(newColis.poids_grammes) : undefined,
        dimensions_cm: newColis.dimensions_cm || undefined
      })

      // Reset du formulaire
      setNewColis({
        numero_colis: '',
        poids_grammes: '',
        dimensions_cm: ''
      })
      setShowCreateDialog(false)
      toast.success('Colis créé avec succès')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du colis')
    }
  }

  // Supprimer un colis
  const handleDeleteColis = async (colisId: string) => {
    try {
      await deleteColis.mutateAsync({
        shipmentId,
        colisId
      })
      setShowDeleteDialog(null)
      toast.success('Colis supprimé avec succès')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression du colis')
    }
  }

  // Générer le prochain numéro de colis
  const getNextColisNumber = () => {
    if (colis.length === 0) return '1'
    const maxNumber = Math.max(...colis.map(c => c.numero_colis))
    return (maxNumber + 1).toString()
  }

  // Statistiques des trackers
  const getTrackingStats = () => {
    if (totalColis === 0) return { color: 'gray', text: 'Aucun colis' }
    if (allHaveTracking) return { color: 'green', text: 'Tous suivis' }
    if (trackingCount === 0) return { color: 'red', text: 'Aucun suivi' }
    return { color: 'orange', text: `${trackingCount}/${totalColis} suivis` }
  }

  const trackingStats = getTrackingStats()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement des colis...</span>
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
            <PackageX className="h-8 w-8 mx-auto mb-2" />
            <p>Erreur lors du chargement des colis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestion des colis ({totalColis})
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    trackingStats.color === 'green' && "bg-green-100 text-green-700",
                    trackingStats.color === 'orange' && "bg-orange-100 text-orange-700",
                    trackingStats.color === 'red' && "bg-red-100 text-red-700",
                    trackingStats.color === 'gray' && "bg-gray-100 text-gray-700"
                  )}
                >
                  <Truck className="h-3 w-3 mr-1" />
                  {trackingStats.text}
                </Badge>

                {missingTracking > 0 && (
                  <Badge variant="outline" className="text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {missingTracking} sans suivi
                  </Badge>
                )}
              </div>
            </div>

            {canEdit && (
              <Button
                onClick={() => {
                  setNewColis(prev => ({
                    ...prev,
                    numero_colis: getNextColisNumber()
                  }))
                  setShowCreateDialog(true)
                }}
                disabled={isMutating}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un colis
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {colis.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Aucun colis</p>
              <p className="text-sm">Commencez par ajouter un colis à cette expédition</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {colis.map((colisItem) => (
                <ColisCard
                  key={colisItem.id}
                  colis={colisItem}
                  shipmentId={shipmentId}
                  canEdit={canEdit}
                  onDelete={canEdit ? () => setShowDeleteDialog(colisItem.id) : undefined}
                />
              ))}
            </div>
          )}

          {/* Résumé multi-tracking */}
          {totalColis > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Résumé tracking Chronopost
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{totalColis}</div>
                  <div className="text-gray-600">Colis total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{trackingCount}</div>
                  <div className="text-gray-600">Avec suivi</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{missingTracking}</div>
                  <div className="text-gray-600">Sans suivi</div>
                </div>
                <div className="text-center">
                  <div className={cn(
                    "text-lg font-bold",
                    allHaveTracking ? "text-green-600" : "text-gray-400"
                  )}>
                    {allHaveTracking ? <CheckCircle2 className="h-5 w-5 mx-auto" /> : <AlertCircle className="h-5 w-5 mx-auto" />}
                  </div>
                  <div className="text-gray-600">Statut</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création de colis */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau colis</DialogTitle>
            <DialogDescription>
              Créez un nouveau colis pour cette expédition
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numero_colis" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Numéro de colis *
              </Label>
              <Input
                id="numero_colis"
                type="number"
                placeholder="Ex: 1"
                value={newColis.numero_colis}
                onChange={(e) => setNewColis(prev => ({
                  ...prev,
                  numero_colis: e.target.value
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poids_grammes">Poids (g)</Label>
                <Input
                  id="poids_grammes"
                  type="number"
                  placeholder="Ex: 1500"
                  value={newColis.poids_grammes}
                  onChange={(e) => setNewColis(prev => ({
                    ...prev,
                    poids_grammes: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions_cm">Dimensions (cm)</Label>
                <Input
                  id="dimensions_cm"
                  placeholder="Ex: 30x20x15"
                  value={newColis.dimensions_cm}
                  onChange={(e) => setNewColis(prev => ({
                    ...prev,
                    dimensions_cm: e.target.value
                  }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateColis}
              disabled={createColis.isPending}
            >
              {createColis.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Créer le colis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le colis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce colis ? Cette action est irréversible et supprimera également tous les produits associés à ce colis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDeleteColis(showDeleteDialog)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteColis.isPending}
            >
              {deleteColis.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}