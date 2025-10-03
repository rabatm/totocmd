/**
 * Chronopost API Integration
 * Service pour récupérer les informations de suivi en temps réel
 */

export interface ChronopostTrackingEvent {
  date: string
  time: string
  location: string
  status: string
  description: string
  code: string
}

export interface ChronopostTrackingInfo {
  trackingNumber: string
  status: 'unknown' | 'processing' | 'in_transit' | 'delivered' | 'exception' | 'returned'
  statusDescription: string
  estimatedDelivery?: string
  currentLocation?: string
  events: ChronopostTrackingEvent[]
  lastUpdate: string
  isDelivered: boolean
}

/**
 * États de suivi Chronopost mappés vers nos statuts internes
 */
const STATUS_MAPPING: Record<string, ChronopostTrackingInfo['status']> = {
  // Codes Chronopost courants
  'PEC': 'processing',      // Prise en charge
  'EXP': 'in_transit',      // Expédié
  'TRI': 'in_transit',      // En cours de tri
  'TRA': 'in_transit',      // En cours de transport
  'ARR': 'in_transit',      // Arrivé en agence
  'LIV': 'delivered',       // Livré
  'RET': 'returned',        // Retourné à l'expéditeur
  'EXC': 'exception',       // Exception
  'ATT': 'in_transit',      // En attente de livraison
}

/**
 * Fonction de simulation d'API Chronopost
 * En production, remplacer par l'appel réel à l'API Chronopost
 */
async function fetchChronopostTracking(trackingNumber: string): Promise<ChronopostTrackingInfo> {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Génération de données simulées basées sur le numéro de suivi
  const seed = trackingNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (seed * 9301 + 49297) % 233280
  const progress = (random / 233280)

  // États possibles selon le progrès simulé
  let status: ChronopostTrackingInfo['status'] = 'processing'
  let events: ChronopostTrackingEvent[] = []

  // Événement initial : prise en charge
  events.push({
    date: '2025-01-15',
    time: '09:30',
    location: 'PARIS - Centre de tri',
    status: 'PEC',
    description: 'Colis pris en charge par Chronopost',
    code: 'PEC'
  })

  if (progress > 0.2) {
    status = 'in_transit'
    events.push({
      date: '2025-01-15',
      time: '14:20',
      location: 'PARIS - Centre de tri',
      status: 'TRI',
      description: 'Colis en cours de tri',
      code: 'TRI'
    })
  }

  if (progress > 0.4) {
    events.push({
      date: '2025-01-16',
      time: '08:15',
      location: 'LYON - Agence de transit',
      status: 'TRA',
      description: 'Colis en cours de transport',
      code: 'TRA'
    })
  }

  if (progress > 0.6) {
    events.push({
      date: '2025-01-16',
      time: '16:45',
      location: 'MARSEILLE - Agence locale',
      status: 'ARR',
      description: 'Colis arrivé en agence de destination',
      code: 'ARR'
    })
  }

  if (progress > 0.8) {
    status = 'delivered'
    events.push({
      date: '2025-01-17',
      time: '11:30',
      location: 'MARSEILLE',
      status: 'LIV',
      description: 'Colis livré - Signature: M. DUPONT',
      code: 'LIV'
    })
  }

  // Tri des événements par date/heure (plus récent en premier)
  events.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())

  const latestEvent = events[0]

  return {
    trackingNumber,
    status,
    statusDescription: getStatusDescription(status),
    currentLocation: latestEvent?.location,
    estimatedDelivery: status === 'in_transit' ? '2025-01-17' : undefined,
    events,
    lastUpdate: new Date().toISOString(),
    isDelivered: status === 'delivered'
  }
}

/**
 * Descriptions en français pour les statuts
 */
function getStatusDescription(status: ChronopostTrackingInfo['status']): string {
  switch (status) {
    case 'processing': return 'En cours de traitement'
    case 'in_transit': return 'En cours de livraison'
    case 'delivered': return 'Livré'
    case 'exception': return 'Incident de livraison'
    case 'returned': return 'Retourné à l\'expéditeur'
    default: return 'Statut inconnu'
  }
}

/**
 * API publique pour récupérer les informations de suivi
 */
export async function getChronopostTracking(trackingNumber: string): Promise<ChronopostTrackingInfo> {
  if (!trackingNumber || trackingNumber.length < 10) {
    throw new Error('Numéro de suivi invalide')
  }

  try {
    // En production, remplacer par l'appel réel à l'API Chronopost
    // const response = await fetch(`https://api.chronopost.fr/tracking/${trackingNumber}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.CHRONOPOST_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // })

    return await fetchChronopostTracking(trackingNumber)
  } catch (error) {
    console.error('Erreur lors de la récupération du suivi Chronopost:', error)
    throw new Error('Impossible de récupérer les informations de suivi')
  }
}

/**
 * Fonction utilitaire pour obtenir la couleur du statut
 */
export function getStatusColor(status: ChronopostTrackingInfo['status']): string {
  switch (status) {
    case 'processing': return 'blue'
    case 'in_transit': return 'orange'
    case 'delivered': return 'green'
    case 'exception': return 'red'
    case 'returned': return 'gray'
    default: return 'gray'
  }
}

/**
 * Fonction utilitaire pour obtenir l'icône du statut
 */
export function getStatusIcon(status: ChronopostTrackingInfo['status']): string {
  switch (status) {
    case 'processing': return '📦'
    case 'in_transit': return '🚛'
    case 'delivered': return '✅'
    case 'exception': return '⚠️'
    case 'returned': return '↩️'
    default: return '❓'
  }
}