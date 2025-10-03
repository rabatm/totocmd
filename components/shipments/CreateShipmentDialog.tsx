'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck, Loader2, Package } from 'lucide-react'
import { CommandeWithDetails, CommandeProduit } from '@/src/types'
import { useCreateShipment } from '@/hooks/useShipments'
import { useActivePersonnel } from '@/hooks/usePersonnel'
import { toast } from 'sonner'

interface CreateShipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commande: CommandeWithDetails
  selectedProducts?: CommandeProduit[]
}

export default function CreateShipmentDialog({
  open,
  onOpenChange,
  commande,
  selectedProducts = []
}: CreateShipmentDialogProps) {
  const createShipment = useCreateShipment()
  const { data: personnelData } = useActivePersonnel()

  const [numeroFacture, setNumeroFacture] = useState('')
  const [preparateurId, setPreparateurId] = useState('')

  // Produits à expédier : soit ceux sélectionnés, soit tous les produits disponibles
  const produitsAExpedier = selectedProducts.length > 0
    ? selectedProducts
    : (commande.commande_produits?.filter(p => p.statut !== 'expedie' && p.statut !== 'livre') || [])

  const personnel = personnelData?.data || []

  // Reset du formulaire quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setNumeroFacture(`EXP-${commande.numero_commande}-${Date.now()}`)
      setPreparateurId('')
    }
  }, [open, commande.numero_commande])

  // Créer l'expédition
  const handleCreateShipment = async () => {
    try {
      if (!numeroFacture.trim()) {
        toast.error('Veuillez saisir un numéro de facture')
        return
      }

      if (!preparateurId) {
        toast.error('Veuillez sélectionner un préparateur')
        return
      }

      if (produitsAExpedier.length === 0) {
        toast.error('Aucun produit à expédier')
        return
      }

      // Récupération du nom du client
      let clientName = 'Client inconnu'
      if (commande.clients && typeof commande.clients === 'object' && 'name' in commande.clients) {
        clientName = commande.clients.name
      } else if (commande.client && typeof commande.client === 'object' && 'name' in commande.client) {
        clientName = commande.client.name
      }

      const shipmentData = {
        commande_id: commande.id,
        client: clientName,
        numero_facture: numeroFacture,
        preparateur_id: preparateurId,
        transporteur: 'Chronopost',
        nombre_colis: 1,
        colis: [{
          numero_colis: 1,
          produits: produitsAExpedier.map(p => ({
            commande_produit_id: p.id,
            quantite_expediee: p.quantite,
            prix_unitaire_ht: 0,
            prix_unitaire_ttc: 0
          }))
        }]
      }

      await createShipment.mutateAsync(shipmentData)
      onOpenChange(false)
      toast.success('Expédition créée avec succès !')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Créer une expédition
          </DialogTitle>
          <DialogDescription>
            Commande #{commande.numero_commande} • {commande.clients?.name || commande.client?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Produits à expédier */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produits à expédier
            </Label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                {produitsAExpedier.length} produit{produitsAExpedier.length > 1 ? 's' : ''} sélectionné{produitsAExpedier.length > 1 ? 's' : ''}
              </p>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {produitsAExpedier.map(p => (
                  <div key={p.id} className="text-xs text-blue-700">
                    • {p.nom_produit} {p.numero_serie ? `(${p.numero_serie})` : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Numéro de facture */}
          <div className="space-y-2">
            <Label htmlFor="numero_facture">Numéro de facture *</Label>
            <Input
              id="numero_facture"
              value={numeroFacture}
              onChange={(e) => setNumeroFacture(e.target.value)}
              placeholder="Ex: EXP-CMD-001"
            />
          </div>

          {/* Sélection du préparateur */}
          <div className="space-y-2">
            <Label htmlFor="preparateur">Préparateur *</Label>
            <Select value={preparateurId} onValueChange={setPreparateurId}>
              <SelectTrigger id="preparateur">
                <SelectValue placeholder="Sélectionnez un préparateur" />
              </SelectTrigger>
              <SelectContent>
                {personnel.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.prenom} {p.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Le vérificateur pourra être ajouté plus tard
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateShipment}
            disabled={createShipment.isPending || !numeroFacture.trim() || !preparateurId}
          >
            {createShipment.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            <Truck className="h-4 w-4 mr-2" />
            Créer l'expédition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}