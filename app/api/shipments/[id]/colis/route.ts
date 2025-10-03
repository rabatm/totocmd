import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// GET /api/shipments/[id]/colis - Liste des colis d'une expédition
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const shipmentId = parseInt(id)

    if (isNaN(shipmentId)) {
      return NextResponse.json(
        { error: 'ID d\'expédition invalide' },
        { status: 400 }
      )
    }

    const { data: colis, error } = await supabase
      .from('shipment_colis')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('numero_colis', { ascending: true })

    if (error) {
      console.error('Erreur lors de la récupération des colis:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des colis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: colis || [],
      total: colis?.length || 0
    })
  } catch (error) {
    console.error('Erreur API colis GET:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/shipments/[id]/colis - Ajouter un nouveau colis à une expédition
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const shipmentId = parseInt(id)
    const body = await request.json()

    if (isNaN(shipmentId)) {
      return NextResponse.json(
        { error: 'ID d\'expédition invalide' },
        { status: 400 }
      )
    }

    // Validation des données requises
    if (!body.numero_colis) {
      return NextResponse.json(
        { error: 'Le numéro de colis est requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'expédition existe
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id')
      .eq('id', shipmentId)
      .single()

    if (shipmentError || !shipment) {
      return NextResponse.json(
        { error: 'Expédition non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier l'unicité du numéro de colis pour cette expédition
    const { data: existingColis } = await supabase
      .from('shipment_colis')
      .select('id')
      .eq('shipment_id', shipmentId)
      .eq('numero_colis', body.numero_colis)
      .single()

    if (existingColis) {
      return NextResponse.json(
        { error: 'Ce numéro de colis existe déjà pour cette expédition' },
        { status: 409 }
      )
    }

    // Créer le nouveau colis
    const { data: newColis, error: colisError } = await supabase
      .from('shipment_colis')
      .insert({
        shipment_id: shipmentId,
        numero_colis: body.numero_colis,
        poids_grammes: body.poids_grammes || null,
        dimensions_cm: body.dimensions_cm || null,
        statut_colis: 'prepare'
      })
      .select()
      .single()

    if (colisError) {
      console.error('Erreur lors de la création du colis:', colisError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du colis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: newColis,
      message: 'Colis créé avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur API colis POST:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}