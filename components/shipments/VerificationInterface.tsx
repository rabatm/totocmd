'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Package,
  Hash,
  Eye,
  
  Clock
} from 'lucide-react'
import { useShipment, useUpdateShipmentStatus } from '@/hooks/useShipments'
import type { ShipmentColis, ShipmentProduit } from '@/src/types'
import { useShipmentProduits } from '@/hooks/useShipmentProduits'
import { useShipmentColis } from '@/hooks/useShipmentColis'
import { ShipmentStatus } from '@/src/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface VerificationInterfaceProps {
  shipmentDataId: number
  className?: string
}

interface VerificationItem {
  id: string
  type: 'colisData' | 'produit'
  reference: string
  description: string
  verified: boolean
  hasIssue: boolean
  issueDescription?: string
}

interface VerificationResult {
  approved: boolean
  rejectionReason?: string
  verificateurNotes?: string
}

export default function VerificationInterface({
  shipmentDataId,
  className
}: VerificationInterfaceProps) {
  const { data: shipmentDataData, isLoading: shipmentDataLoading } = useShipment(shipmentDataId)
   const { data: colisDataRaw = { data: [], total: 0 }, isLoading: colisDataLoading } = useShipmentColis(shipmentDataId);
   const { data: produitsDataArray = [], isLoading: produitsDataLoading } = useShipmentProduits(shipmentDataId);
   const colisDataArray = colisDataRaw.data;
  const updateStatus = useUpdateShipmentStatus()

  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([])
  const [activeTab, setActiveTab] = useState('verification')
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({
    approved: true
  })

  // Initialiser les éléments de vérification
   useEffect(() => {
     if (colisDataArray.length > 0 || produitsDataArray.length > 0) {
       const items: VerificationItem[] = [];

       colisDataArray.forEach((c: ShipmentColis) => {
         items.push({
           id: `colisData-${c.id}`,
           type: 'colisData',
           reference: `Colis #${c.numero_colis}`,
           description: `${c.poids_grammes ? c.poids_grammes + 'g' : 'Poids non défini'} - ${c.dimensions_cm || 'Dimensions non définies'}`,
           verified: false,
           hasIssue: false
         });
       });

       produitsDataArray.forEach((p: ShipmentProduit) => {
         items.push({
           id: `produit-${p.id}`,
           type: 'produit',
           reference: p.commande_produit?.nom_produit || '',
           description: `Quantité: ${p.commande_produit?.quantite ?? ''}`,
           verified: false,
           hasIssue: false
         });
       });

       setVerificationItems(items);
     }
   }, [colisDataArray, produitsDataArray]);

  // Gestion des vérifications
  const handleItemVerification = (itemId: string, verified: boolean, hasIssue: boolean = false, issueDescription?: string) => {
    setVerificationItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, verified, hasIssue, issueDescription }
          : item
      )
    )
  }

  // Statistiques de vérification
  const getVerificationStats = () => {
    const totalItems = verificationItems.length
    const verifiedItems = verificationItems.filter(item => item.verified).length
    const itemsWithIssues = verificationItems.filter(item => item.hasIssue).length

    return {
      totalItems,
      verifiedItems,
      itemsWithIssues,
      progressPercent: totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 0,
      isComplete: totalItems > 0 && verifiedItems === totalItems,
      hasIssues: itemsWithIssues > 0
    }
  }

  const stats = getVerificationStats()

  // Finaliser la vérification
  const handleFinalizeVerification = () => {
    if (!stats.isComplete) {
      toast.error('Veuillez vérifier tous les éléments avant de finaliser')
      return
    }

    setVerificationResult({
      approved: !stats.hasIssues,
      rejectionReason: stats.hasIssues ? 'Problèmes détectés lors de la vérification' : undefined
    })
    setShowResultDialog(true)
  }

  // Valider ou rejeter l&apos;expédition
  const handleSubmitVerification = async () => {
    try {
      const newStatus: ShipmentStatus = verificationResult.approved ? 'verifiee' : 'preparee'

       await updateStatus.mutateAsync({
         shipmentId: shipmentDataId,
         statut: newStatus
       })

      setShowResultDialog(false)
      toast.success(
        verificationResult.approved
          ? 'Vérification approuvée - Expédition prête'
          : 'Vérification rejetée - Retour en préparation'
      )
    } catch (error) {
      toast.error('Erreur lors de la validation de la vérification')
    }
  }

  if (shipmentDataLoading || produitsDataLoading || colisDataLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement de la vérification...</span>
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
                <Eye className="h-5 w-5" />
                Vérification Expédition #{shipmentDataId}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
{shipmentDataData?.data?.preparateur_info?.nom && (
  <Badge variant="outline" className="flex items-center gap-1">
    <Package className="h-3 w-3" />
    Préparé par: {shipmentDataData.data.preparateur_info.nom}
  </Badge>
)}
{shipmentDataData?.data?.verificateur_info?.nom && (
  <Badge variant="outline" className="flex items-center gap-1">
    <User className="h-3 w-3" />
    Vérificateur: {shipmentDataData.data.verificateur_info.nom}
  </Badge>
)}
                <Badge
                  variant="secondary"
                  className={cn(
                    stats.isComplete && !stats.hasIssues ? "bg-green-100 text-green-700" :
                    stats.hasIssues ? "bg-red-100 text-red-700" :
                    "bg-orange-100 text-orange-700"
                  )}
                >
                  {stats.verifiedItems}/{stats.totalItems} vérifiés
                  {stats.hasIssues && ` (${stats.itemsWithIssues} problèmes)`}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {stats.progressPercent}%
              </div>
              <div className="text-sm text-gray-600">
                Progression
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interface de vérification */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verification">Vérification</TabsTrigger>
          <TabsTrigger value="summary">Résumé</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Éléments à vérifier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationItems.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 border rounded-lg space-y-3",
                      item.verified && !item.hasIssue ? "border-green-200 bg-green-50" :
                      item.hasIssue ? "border-red-200 bg-red-50" :
                      "border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {item.type === 'colisData' ? (
                            <Hash className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Package className="h-4 w-4 text-gray-500" />
                          )}
                          <div>
                            <div className="font-medium">{item.reference}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant={item.verified && !item.hasIssue ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleItemVerification(item.id, true, false)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          OK
                        </Button>
                        <Button
                          variant={item.hasIssue ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => {
                            const issue = prompt("Décrivez le problème détecté:")
                            if (issue) {
                              handleItemVerification(item.id, true, true, issue)
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Problème
                        </Button>
                      </div>
                    </div>

                    {item.hasIssue && item.issueDescription && (
                      <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-700">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {item.issueDescription}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalItems}</div>
                <div className="text-sm text-gray-600">Éléments total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.verifiedItems}</div>
                <div className="text-sm text-gray-600">Vérifiés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600">{stats.itemsWithIssues}</div>
                <div className="text-sm text-gray-600">Problèmes</div>
              </CardContent>
            </Card>
          </div>

          {stats.hasIssues && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Problèmes détectés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {verificationItems
                    .filter(item => item.hasIssue)
                    .map(item => (
                      <div key={item.id} className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                        <div className="font-medium text-red-700">{item.reference}</div>
                        <div className="text-sm text-red-600">{item.issueDescription}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Actions de finalisation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Finalisation de la vérification</h3>
              <p className="text-sm text-gray-600">
                {stats.isComplete
                  ? stats.hasIssues
                    ? "Vérification terminée avec des problèmes détectés."
                    : "Vérification terminée sans problème. L&apos;expédition est prête."
                  : `Il reste ${stats.totalItems - stats.verifiedItems} éléments à vérifier.`
                }
              </p>
            </div>

            <Button
              onClick={handleFinalizeVerification}
              disabled={!stats.isComplete}
              className={cn(
                "min-w-32",
                stats.isComplete && !stats.hasIssues ? "bg-green-600 hover:bg-green-700" :
                stats.hasIssues ? "bg-red-600 hover:bg-red-700" :
                ""
              )}
            >
              {stats.isComplete ? (
                stats.hasIssues ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Signaler les problèmes
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approuver l&apos;expédition
                  </>
                )
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Vérification incomplète
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de finalisation */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verificationResult.approved ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {verificationResult.approved ? 'Approuver' : 'Rejeter'} l&apos;expédition
            </DialogTitle>
            <DialogDescription>
              {verificationResult.approved
                ? "L&apos;expédition sera marquée comme prête pour l'envoi."
                : "L&apos;expédition sera renvoyée en préparation pour correction."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificateur_notes">Notes du vérificateur</Label>
              <Textarea
                id="verificateur_notes"
                placeholder="Notes additionnelles (optionnel)..."
                value={verificationResult.verificateurNotes || ''}
                onChange={(e) => setVerificationResult(prev => ({
                  ...prev,
                  verificateurNotes: e.target.value
                }))}
              />
            </div>

            {stats.hasIssues && (
              <div className="p-3 bg-red-50 rounded border">
                <p className="text-sm text-red-700 font-medium mb-2">
                  Problèmes détectés qui nécessitent une correction:
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {verificationItems
                    .filter(item => item.hasIssue)
                    .map(item => (
                      <li key={item.id}>• {item.reference}: {item.issueDescription}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResultDialog(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitVerification}
              disabled={updateStatus.isPending}
              className={verificationResult.approved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {updateStatus.isPending && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {verificationResult.approved ? 'Approuver' : 'Rejeter'} l&apos;expédition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}