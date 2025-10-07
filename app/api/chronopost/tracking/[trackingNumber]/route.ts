import { NextRequest, NextResponse } from 'next/server'
import { getChronopostTracking } from '@/lib/chronopost-api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Numéro de suivi requis' },
        { status: 400 }
      )
    }

    const trackingInfo = await getChronopostTracking(trackingNumber)

    return NextResponse.json({
      success: true,
      data: trackingInfo
    })
  } catch (error) {
    console.error('Erreur API tracking Chronopost:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération du suivi',
        success: false
      },
      { status: 500 }
    )
  }
}