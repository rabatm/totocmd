'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Package,
  CheckCircle2,
  User,
  Clock,
  AlertTriangle,
  Hash,
  Box
} from 'lucide-react'
import { useShipmentById, useUpdateShipmentStatus } from '@/hooks/useShipments'
import { useShipmentProduits } from '@/hooks/useShipmentProduits'
import { useShipmentColis } from '@/hooks/useShipmentColis'
import { ShipmentStatus } from '@/src/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PreparationInterfaceProps {
  shipmentId: number
  className?: string
}

interface ProductItem {
  id: string
  produit_id: number
  nom: string
  quantite: number
  checked: boolean
}

interface ColisItem {
  id: string
  numero_colis: number
  checked: boolean
  produits: ProductItem[]
}

export default function PreparationInterface({
  shipmentId,
  className
}: PreparationInterfaceProps) {
  const { data: shipment, isLoading: shipmentLoading } = useShipmentById(shipmentId)
  const { data: produits, isLoading: produitsLoading } = useShipmentProduits(shipmentId)
  const { data: colis, isLoading: colisLoading } = useShipmentColis(shipmentId)
  const updateStatus = useUpdateShipmentStatus()

  const [preparationData, setPreparationData] = useState<ColisItem[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  // Initialiser les données de préparation
  useEffect(() => {
    if (colis && produits) {
      const colisData: ColisItem[] = colis.map(c => ({
        id: c.id,
        numero_colis: c.numero_colis,
        checked: false,
        produits: produits.map(p => ({
          id: p.id,
          produit_id: p.produit_id,
          nom: p.nom,
          quantite: p.quantite,
          checked: false
        }))
      }))

      setPreparationData(colisData)
    }
  }, [colis, produits])

  // Gestion des cochages
  const handleProductCheck = (colisId: string, productId: string, checked: boolean) => {
    setPreparationData(prev =>
      prev.map(c =>
        c.id === colisId
          ? {
              ...c,
              produits: c.produits.map(p =>
                p.id === productId ? { ...p, checked } : p
              )
            }
          : c
      )
    )
  }

  const handleColisCheck = (colisId: string, checked: boolean) => {
    setPreparationData(prev =>
      prev.map(c =>
        c.id === colisId
          ? {
              ...c,
              checked,
              produits: c.produits.map(p => ({ ...p, checked }))
            }
          : c
      )
    )
  }

  // Statistiques de préparation
  const getPreparationStats = () => {
    const totalColis = preparationData.length
    const colisCompleted = preparationData.filter(c =>
      c.produits.length > 0 && c.produits.every(p => p.checked)
    ).length

    const totalProduits = preparationData.reduce((acc, c) => acc + c.produits.length, 0)
    const produitsCompleted = preparationData.reduce(
      (acc, c) => acc + c.produits.filter(p => p.checked).length,
      0
    )

    return {
      totalColis,
      colisCompleted,
      totalProduits,
      produitsCompleted,
      progressPercent: totalProduits > 0 ? Math.round((produitsCompleted / totalProduits) * 100) : 0,
      isComplete: totalColis > 0 && colisCompleted === totalColis
    }
  }

  const stats = getPreparationStats()

  // Valider la préparation
  const handleValidatePreparation = async () => {
    try {
      if (!stats.isComplete) {
        toast.error('Veuillez compléter la préparation de tous les colis avant de valider')
        return
      }

      await updateStatus.mutateAsync({
        shipmentId,
        status: 'pret_verification' as ShipmentStatus
      })

      toast.success('Préparation validée avec succès')
    } catch (error) {
      toast.error('Erreur lors de la validation de la préparation')
    }
  }

  if (shipmentLoading || produitsLoading || colisLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement de la préparation...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête avec informations de l'expédition */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Préparation Expédition #{shipmentId}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                {shipment?.preparateur_nom && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Préparateur: {shipment.preparateur_nom}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={cn(
                    stats.isComplete ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                  )}
                >
                  {stats.colisCompleted}/{stats.totalColis} colis prêts
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {stats.progressPercent}%
              </div>
              <div className="text-sm text-gray-600">
                {stats.produitsCompleted}/{stats.totalProduits} produits
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interface de préparation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="by-colis">Par colis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Préparation par produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {preparationData.length > 0 && preparationData[0].produits.map(produit => {
                  const checkedCount = preparationData.filter(c =>
                    c.produits.find(p => p.produit_id === produit.produit_id)?.checked
                  ).length
                  const totalCount = preparationData.filter(c =>
                    c.produits.some(p => p.produit_id === produit.produit_id)
                  ).length

                  return (
                    <div key={produit.produit_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{produit.nom}</div>
                        <Badge variant="outline">
                          Quantité: {produit.quantite}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          {checkedCount}/{totalCount} colis
                        </div>
                        <Badge
                          variant={checkedCount === totalCount ? "default" : "secondary"}
                          className={cn(
                            checkedCount === totalCount ? "bg-green-100 text-green-700" : ""
                          )}
                        >
                          {checkedCount === totalCount ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {checkedCount === totalCount ? "Complet" : "En cours"}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-colis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {preparationData.map(colisItem => {
              const isComplete = colisItem.produits.length > 0 && colisItem.produits.every(p => p.checked)
              const completedCount = colisItem.produits.filter(p => p.checked).length

              return (
                <Card key={colisItem.id} className={cn(
                  "border-2",
                  isComplete ? "border-green-200 bg-green-50" : "border-gray-200"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={isComplete}
                          onCheckedChange={(checked) =>
                            handleColisCheck(colisItem.id, checked as boolean)
                          }
                        />
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Hash className="h-4 w-4" />
                          Colis #{colisItem.numero_colis}
                        </CardTitle>
                      </div>

                      <Badge
                        variant={isComplete ? "default" : "secondary"}
                        className={cn(
                          isComplete ? "bg-green-100 text-green-700" : ""
                        )}
                      >
                        {completedCount}/{colisItem.produits.length}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {colisItem.produits.map(produit => (
                      <div key={produit.id} className="flex items-center gap-3 p-2 rounded border">
                        <Checkbox
                          checked={produit.checked}
                          onCheckedChange={(checked) =>
                            handleProductCheck(colisItem.id, produit.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{produit.nom}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Qté: {produit.quantite}
                        </Badge>
                      </div>
                    ))}

                    {colisItem.produits.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm">Aucun produit assigné à ce colis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions de validation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium">Validation de la préparation</h3>
              <p className="text-sm text-gray-600">
                {stats.isComplete
                  ? "Tous les produits sont préparés. Vous pouvez valider la préparation."
                  : `Il reste ${stats.totalProduits - stats.produitsCompleted} produits à préparer.`
                }
              </p>
            </div>

            <Button
              onClick={handleValidatePreparation}
              disabled={!stats.isComplete || updateStatus.isPending}
              className={cn(
                "min-w-32",
                stats.isComplete ? "bg-green-600 hover:bg-green-700" : ""
              )}
            >
              {updateStatus.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {stats.isComplete ? "Valider la préparation" : "Préparation incomplète"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}