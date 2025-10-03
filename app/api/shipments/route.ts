import { supabase } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'
import { CreateShipmentInput, ShipmentWithDetails } from '@/src/types';

// GET /api/shipments - Liste des expéditions avec filtres multi-colis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Paramètres de filtrage étendus
    const search = searchParams.get('search')
    const statut = searchParams.get('statut')
    const commande_id = searchParams.get('commande_id')
    const preparateur_id = searchParams.get('preparateur_id')
    const verificateur_id = searchParams.get('verificateur_id')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    // Requête avec relations pour le multi-colis
    let query = supabase
      .from('shipments')
      .select(`
        *,
        colis:shipment_colis(*),
        shipment_produits(*),
        preparateur_info:personnel!preparateur_id(nom),
        verificateur_info:personnel!verificateur_id(nom)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filtres conditionnels
    if (statut) {
      query = query.eq('statut', statut)
    }
    if (commande_id) {
      query = query.eq('commande_id', commande_id)
    }

    const { data: shipments, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des expéditions:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des expéditions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: shipments as ShipmentWithDetails[],
      total: shipments?.length || 0
    })
  } catch (error) {
    console.error('Erreur API shipments GET:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// POST /api/shipments - Création d'une expédition multi-colis
export async function POST(request: NextRequest) {
  try {
    const body: CreateShipmentInput = await request.json()

    // Validation des données requises
    if (!body.commande_id || !body.preparateur_id) {
      return NextResponse.json(
        { error: 'Données manquantes: commande_id et preparateur_id sont requis' },
        { status: 400 }
      )
    }

    // Récupérer les noms du personnel si fournis
    let preparateurNom = ''
    let verificateurNom = ''

    if (body.preparateur_id) {
      const { data: prep } = await supabase
        .from('personnel')
        .select('prenom, nom')
        .eq('id', body.preparateur_id)
        .single()
      if (prep) preparateurNom = `${prep.prenom} ${prep.nom}`
    }

    if (body.verificateur_id) {
      const { data: verif } = await supabase
        .from('personnel')
        .select('prenom, nom')
        .eq('id', body.verificateur_id)
        .single()
      if (verif) verificateurNom = `${verif.prenom} ${verif.nom}`
    }

    // Création de l'expédition de base
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        commande_id: body.commande_id,
        client: body.client || 'Client inconnu',
        numero_facture: body.numero_facture,
        fa_bl_number: body.numero_facture || `EXP-${Date.now()}`,
        preparateur: preparateurNom || null,
        verificateur: verificateurNom || null,
        preparateur_id: body.preparateur_id,
        verificateur_id: body.verificateur_id || null,
        transporteur: body.transporteur || 'Chronopost',
        nombre_colis: body.colis?.length || 1,
        statut: 'brouillon',
        date_envoi: new Date().toISOString()
      })
      .select()
      .single()

    if (shipmentError) {
      console.error('Erreur lors de la création de l\'expédition:', shipmentError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'expédition' },
        { status: 500 }
      )
    }

    // Création des colis si fournis
    if (body.colis && body.colis.length > 0) {
      const colisPromises = body.colis.map(async (colis) => {
        const { data: colisData, error: colisError } = await supabase
          .from('shipment_colis')
          .insert({
            shipment_id: shipment.id,
            numero_colis: colis.numero_colis,
            poids_grammes: colis.poids_grammes,
            dimensions_cm: colis.dimensions_cm,
            statut_colis: 'prepare'
          })
          .select()
          .single()

        if (colisError) throw colisError

        // Créer les produits pour ce colis
        if (colis.produits && colis.produits.length > 0) {
          const produitsPromises = colis.produits.map((produit) =>
            supabase
              .from('shipment_produits')
              .insert({
                shipment_id: shipment.id,
                commande_produit_id: produit.commande_produit_id,
                quantite_expediee: produit.quantite_expediee,
                prix_unitaire_ht: produit.prix_unitaire_ht,
                prix_unitaire_ttc: produit.prix_unitaire_ttc,
                numero_colis: colis.numero_colis
              })
          )

          await Promise.all(produitsPromises)
        }

        return colisData
      })

      await Promise.all(colisPromises)
    }

    // Récupération de l'expédition complète
    const { data: fullShipment } = await supabase
      .from('shipments')
      .select(`
        *,
        colis:shipment_colis(*),
        shipment_produits(*)
      `)
      .eq('id', shipment.id)
      .single()

    return NextResponse.json({
      data: fullShipment,
      message: 'Expédition créée avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur API shipments POST:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'expédition' },
      { status: 500 }
    )
  }
}