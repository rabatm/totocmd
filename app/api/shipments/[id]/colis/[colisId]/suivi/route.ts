import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

interface RouteContext {
  params: Promise<{
    id: string
    colisId: string
  }>
}

// PUT /api/shipments/[id]/colis/[colisId]/suivi - Mise à jour du numéro de suivi Chronopost
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id, colisId } = await params
    const shipmentId = parseInt(id)
    const body = await request.json()

    if (isNaN(shipmentId)) {
      return NextResponse.json(
        { error: 'ID d\'expédition invalide' },
        { status: 400 }
      )
    }

    if (!body.numero_suivi_chronopost) {
      return NextResponse.json(
        { error: 'Le numéro de suivi Chronopost est requis' },
        { status: 400 }
      )
    }

    // Vérification format numéro de suivi Chronopost (exemple: 1234567890123)
    const suiviRegex = /^[A-Z0-9]{10,20}$/
    if (!suiviRegex.test(body.numero_suivi_chronopost)) {
      return NextResponse.json(
        { error: 'Format de numéro de suivi Chronopost invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le colis existe et appartient à cette expédition
    const { data: existingColis, error: checkError } = await supabase
      .from('shipment_colis')
      .select('id, statut_colis')
      .eq('id', colisId)
      .eq('shipment_id', shipmentId)
      .single()

    if (checkError || !existingColis) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier l'unicité du numéro de suivi (global)
    const { data: existingSuivi } = await supabase
      .from('shipment_colis')
      .select('id')
      .eq('numero_suivi_chronopost', body.numero_suivi_chronopost)
      .neq('id', colisId)
      .single()

    if (existingSuivi) {
      return NextResponse.json(
        { error: 'Ce numéro de suivi Chronopost est déjà utilisé' },
        { status: 409 }
      )
    }

    // Mise à jour du numéro de suivi et du statut
    const updateData: any = {
      numero_suivi_chronopost: body.numero_suivi_chronopost,
      updated_at: new Date().toISOString()
    }

    // Si le colis était seulement préparé, le passer à "expédié"
    if (existingColis.statut_colis === 'prepare') {
      updateData.statut_colis = 'expedie'
      updateData.date_expedition = new Date().toISOString()
    }

    const { data: updatedColis, error: updateError } = await supabase
      .from('shipment_colis')
      .update(updateData)
      .eq('id', colisId)
      .eq('shipment_id', shipmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour du suivi:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du numéro de suivi' },
        { status: 500 }
      )
    }

    // Vérifier si tous les colis de l'expédition ont un numéro de suivi
    const { data: allColis } = await supabase
      .from('shipment_colis')
      .select('numero_suivi_chronopost')
      .eq('shipment_id', shipmentId)

    const allHaveTracking = allColis?.every(c => c.numero_suivi_chronopost)

    // Si tous les colis ont un suivi, mettre à jour le statut de l'expédition
    if (allHaveTracking) {
      await supabase
        .from('shipments')
        .update({
          statut: 'expediee',
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId)
    }

    return NextResponse.json({
      data: updatedColis,
      message: 'Numéro de suivi mis à jour avec succès',
      expeditionUpdated: allHaveTracking
    })

  } catch (error) {
    console.error('Erreur API suivi PUT:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// GET /api/shipments/[id]/colis/[colisId]/suivi - Récupération des infos de suivi
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id, colisId } = await params
    const shipmentId = parseInt(id)

    if (isNaN(shipmentId)) {
      return NextResponse.json(
        { error: 'ID d\'expédition invalide' },
        { status: 400 }
      )
    }

    const { data: colis, error } = await supabase
      .from('shipment_colis')
      .select(`
        id,
        numero_colis,
        numero_suivi_chronopost,
        statut_colis,
        date_expedition,
        date_livraison
      `)
      .eq('id', colisId)
      .eq('shipment_id', shipmentId)
      .single()

    if (error || !colis) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    // Construire l'URL de tracking Chronopost si disponible
    let trackingUrl = null
    if (colis.numero_suivi_chronopost) {
      trackingUrl = `https://www.chronopost.fr/tracking-colis?listeNumerosLT=${colis.numero_suivi_chronopost}`
    }

    return NextResponse.json({
      data: {
        ...colis,
        tracking_url: trackingUrl,
        has_tracking: !!colis.numero_suivi_chronopost
      }
    })

  } catch (error) {
    console.error('Erreur API suivi GET:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}