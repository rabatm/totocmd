import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { UpdateColisInput } from '@/src/types'

interface RouteContext {
  params: Promise<{
    id: string
    colisId: string
  }>
}

// GET /api/shipments/[id]/colis/[colisId] - Détails d'un colis spécifique
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
        *,
        produits:shipment_produits!numero_colis(*,
          commande_produit:commande_produits(*)
        )
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

    return NextResponse.json({
      data: colis
    })
  } catch (error) {
    console.error('Erreur API colis GET:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// PUT /api/shipments/[id]/colis/[colisId] - Mise à jour d'un colis
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id, colisId } = await params
    const shipmentId = parseInt(id)
    const body: UpdateColisInput = await request.json()

    if (isNaN(shipmentId)) {
      return NextResponse.json(
        { error: 'ID d\'expédition invalide' },
        { status: 400 }
      )
    }

    // Vérifier que le colis existe et appartient à cette expédition
    const { data: existingColis, error: checkError } = await supabase
      .from('shipment_colis')
      .select('id')
      .eq('id', colisId)
      .eq('shipment_id', shipmentId)
      .single()

    if (checkError || !existingColis) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    // Construire l'objet de mise à jour
    const updateData: Partial<import('@/src/types').ShipmentColis> & Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (body.numero_suivi_chronopost !== undefined) {
      updateData.numero_suivi_chronopost = body.numero_suivi_chronopost
    }
    if (body.poids_grammes !== undefined) {
      updateData.poids_grammes = body.poids_grammes
    }
    if (body.dimensions_cm !== undefined) {
      updateData.dimensions_cm = body.dimensions_cm
    }
    if (body.statut_colis !== undefined) {
      updateData.statut_colis = body.statut_colis

      // Mise à jour automatique des dates selon le statut
      if (body.statut_colis === 'expedie' && !updateData.date_expedition) {
        updateData.date_expedition = new Date().toISOString()
      }
      if (body.statut_colis === 'livre' && !updateData.date_livraison) {
        updateData.date_livraison = new Date().toISOString()
      }
    }

    // Mise à jour du colis
    const { data: updatedColis, error: updateError } = await supabase
      .from('shipment_colis')
      .update(updateData)
      .eq('id', colisId)
      .eq('shipment_id', shipmentId)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour du colis:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du colis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: updatedColis,
      message: 'Colis mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur API colis PUT:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/shipments/[id]/colis/[colisId] - Suppression d'un colis
export async function DELETE(
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

    // Vérifier que le colis existe et appartient à cette expédition
    const { data: existingColis, error: checkError } = await supabase
      .from('shipment_colis')
      .select('numero_colis')
      .eq('id', colisId)
      .eq('shipment_id', shipmentId)
      .single()

    if (checkError || !existingColis) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer d'abord les produits associés à ce colis
    const { error: produitsError } = await supabase
      .from('shipment_produits')
      .delete()
      .eq('shipment_id', shipmentId)
      .eq('numero_colis', existingColis.numero_colis)

    if (produitsError) {
      console.error('Erreur lors de la suppression des produits du colis:', produitsError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des produits du colis' },
        { status: 500 }
      )
    }

    // Supprimer le colis
    const { error: deleteError } = await supabase
      .from('shipment_colis')
      .delete()
      .eq('id', colisId)
      .eq('shipment_id', shipmentId)

    if (deleteError) {
      console.error('Erreur lors de la suppression du colis:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du colis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Colis supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur API colis DELETE:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}