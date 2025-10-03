'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Calendar,
  Navigation
} from 'lucide-react'
import { useChronopostTracking } from '@/hooks/useChronopostTracking'
import { ChronopostTrackingInfo, getStatusColor, getStatusIcon } from '@/lib/chronopost-api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ChronopostTrackerProps {
  trackingNumber: string
  className?: string
  compact?: boolean
}

export default function ChronopostTracker({
  trackingNumber,
  className,
  compact = false
}: ChronopostTrackerProps) {
  const [showFullTracking, setShowFullTracking] = useState(false)
  const { data: tracking, isLoading, error, refetch, isRefetching } = useChronopostTracking(trackingNumber)

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success('Informations de suivi mises à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="text-sm text-gray-600">Récupération du suivi...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full border-red-200", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Erreur de suivi</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!tracking) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Package className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Aucune information de suivi disponible</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusColor = getStatusColor(tracking.status)
  const statusIcon = getStatusIcon(tracking.status)
  const latestEvent = tracking.events[0]

  // Vue compacte pour l'affichage dans les listes
  if (compact) {
    return (
      <div className={cn("flex items-center justify-between p-3 border rounded-lg", className)}>
        <div className="flex items-center space-x-3">
          <div className="text-lg">{statusIcon}</div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant={statusColor === 'green' ? 'default' : 'secondary'} className={cn(
                statusColor === 'green' && 'bg-green-100 text-green-800',
                statusColor === 'orange' && 'bg-orange-100 text-orange-800',
                statusColor === 'blue' && 'bg-blue-100 text-blue-800',
                statusColor === 'red' && 'bg-red-100 text-red-800'
              )}>
                {tracking.statusDescription}
              </Badge>
            </div>
            {latestEvent && (
              <p className="text-xs text-gray-500 mt-1">
                {latestEvent.location} • {latestEvent.date}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showFullTracking} onOpenChange={setShowFullTracking}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Navigation className="h-3 w-3 mr-1" />
                Détails
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <TrackingDetailDialog tracking={tracking} onRefresh={handleRefresh} isRefetching={isRefetching} />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://www.chronopost.fr/tracking-colis?listeNumerosLT=${trackingNumber}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  // Vue complète
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2">
            <span className="text-lg">{statusIcon}</span>
            <span>Suivi Chronopost</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isRefetching && "animate-spin")} />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://www.chronopost.fr/tracking-colis?listeNumerosLT=${trackingNumber}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Site Chronopost
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statut actuel */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <Badge variant={statusColor === 'green' ? 'default' : 'secondary'} className={cn(
              statusColor === 'green' && 'bg-green-100 text-green-800',
              statusColor === 'orange' && 'bg-orange-100 text-orange-800',
              statusColor === 'blue' && 'bg-blue-100 text-blue-800',
              statusColor === 'red' && 'bg-red-100 text-red-800'
            )}>
              {tracking.statusDescription}
            </Badge>
            {tracking.currentLocation && (
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {tracking.currentLocation}
              </p>
            )}
          </div>

          {tracking.estimatedDelivery && !tracking.isDelivered && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Livraison prévue</p>
              <p className="text-sm font-medium flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(tracking.estimatedDelivery).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        {/* Historique des événements */}
        {tracking.events.length > 0 && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Historique de livraison
            </h4>
            <div className="space-y-3">
              {tracking.events.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-start space-x-3 relative">
                  {index < tracking.events.length - 1 && (
                    <div className="absolute left-2 top-6 w-0.5 h-8 bg-gray-200" />
                  )}

                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 bg-white flex-shrink-0 mt-0.5",
                    index === 0 ? "border-blue-500" : "border-gray-300"
                  )} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {event.description}
                      </p>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}

              {tracking.events.length > 3 && (
                <Dialog open={showFullTracking} onOpenChange={setShowFullTracking}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      Voir l'historique complet ({tracking.events.length} événements)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <TrackingDetailDialog tracking={tracking} onRefresh={handleRefresh} isRefetching={isRefetching} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}

        {/* Numéro de suivi */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p>Numéro de suivi: <span className="font-mono">{tracking.trackingNumber}</span></p>
          <p>Dernière mise à jour: {new Date(tracking.lastUpdate).toLocaleString('fr-FR')}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour le dialog de détail complet
function TrackingDetailDialog({
  tracking,
  onRefresh,
  isRefetching
}: {
  tracking: ChronopostTrackingInfo
  onRefresh: () => void
  isRefetching: boolean
}) {
  const statusColor = getStatusColor(tracking.status)
  const statusIcon = getStatusIcon(tracking.status)

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <span className="text-lg">{statusIcon}</span>
          <span>Suivi détaillé - {tracking.trackingNumber}</span>
        </DialogTitle>
        <DialogDescription>
          Historique complet de livraison Chronopost
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Statut actuel */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={statusColor === 'green' ? 'default' : 'secondary'} className={cn(
              statusColor === 'green' && 'bg-green-100 text-green-800',
              statusColor === 'orange' && 'bg-orange-100 text-orange-800',
              statusColor === 'blue' && 'bg-blue-100 text-blue-800',
              statusColor === 'red' && 'bg-red-100 text-red-800'
            )}>
              {tracking.statusDescription}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", isRefetching && "animate-spin")} />
              Actualiser
            </Button>
          </div>

          {tracking.currentLocation && (
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              Position actuelle: {tracking.currentLocation}
            </p>
          )}

          {tracking.estimatedDelivery && !tracking.isDelivered && (
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Livraison prévue: {new Date(tracking.estimatedDelivery).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>

        <Separator />

        {/* Historique complet */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-4">Historique complet</h4>
          <div className="space-y-4">
            {tracking.events.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 relative">
                {index < tracking.events.length - 1 && (
                  <div className="absolute left-2 top-6 w-0.5 h-12 bg-gray-200" />
                )}

                <div className={cn(
                  "w-4 h-4 rounded-full border-2 bg-white flex-shrink-0 mt-0.5",
                  index === 0 ? "border-blue-500 bg-blue-50" : "border-gray-300"
                )} />

                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <p>{event.date}</p>
                      <p>{event.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <p>Dernière mise à jour: {new Date(tracking.lastUpdate).toLocaleString('fr-FR')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://www.chronopost.fr/tracking-colis?listeNumerosLT=${tracking.trackingNumber}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Voir sur Chronopost
          </Button>
        </div>
      </div>
    </>
  )
}