import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log(`🔄 GET /shipments/${id}/produits`);

    const { data: shipmentProduits, error } = await supabase
      .from('shipment_produits')
      .select(`
        id,
        shipment_id,
        commande_produit_id,
        quantite_expediee,
        prix_unitaire_ht,
        prix_unitaire_ttc,
        created_at,
        updated_at,
        commande_produits (
          id,
          nom_produit,
          code_produit,
          numero_serie,
          quantite,
          statut,
          remarque,
          date_scan
        )
      `)
      .eq('shipment_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erreur récupération produits shipment:', error);
      return NextResponse.json(
        {
          error: 'Erreur lors de la récupération des produits',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log(`✅ ${shipmentProduits?.length || 0} produits récupérés pour l'expédition ${id}`);

    return NextResponse.json({
      success: true,
      produits: shipmentProduits || [],
      count: shipmentProduits?.length || 0
    });

  } catch (error) {
    console.error(`Erreur récupération produits shipment:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log(`🔄 POST /shipments/${id}/produits - Ajout produit`);
    const body = await request.json();

    const { commande_produit_id, quantite_expediee, prix_unitaire_ht, prix_unitaire_ttc } = body;

    // Vérification que l'expédition existe et est modifiable
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('statut')
      .eq('id', id)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        { error: 'Expédition non trouvée' },
        { status: 404 }
      );
    }

    if (!['brouillon', 'En préparation'].includes(shipment.statut)) {
      return NextResponse.json(
        { error: 'Impossible d\'ajouter des produits à une expédition déjà traitée' },
        { status: 400 }
      );
    }

    // Ajout du produit
    const { data: shipmentProduit, error } = await supabase
      .from('shipment_produits')
      .insert({
        shipment_id: parseInt(id),
        commande_produit_id,
        quantite_expediee,
        prix_unitaire_ht,
        prix_unitaire_ttc
      })
      .select(`
        id,
        shipment_id,
        commande_produit_id,
        quantite_expediee,
        prix_unitaire_ht,
        prix_unitaire_ttc,
        created_at,
        updated_at,
        commande_produits (
          id,
          nom_produit,
          code_produit,
          numero_serie,
          quantite,
          statut
        )
      `)
      .single();

    if (error) {
      console.error('❌ Erreur ajout produit à shipment:', error);
      return NextResponse.json(
        {
          error: 'Erreur lors de l\'ajout du produit à l\'expédition',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Mise à jour des totaux de l'expédition
    const { data: allProduits } = await supabase
      .from('shipment_produits')
      .select('quantite_expediee, prix_unitaire_ht, prix_unitaire_ttc')
      .eq('shipment_id', id);

    if (allProduits) {
      const totalHt = allProduits.reduce((sum, p) => sum + (p.prix_unitaire_ht * p.quantite_expediee), 0);
      const totalTtc = allProduits.reduce((sum, p) => sum + (p.prix_unitaire_ttc * p.quantite_expediee), 0);
      const totalTva = totalTtc - totalHt;

      await supabase
        .from('shipments')
        .update({
          total_ht: totalHt,
          total_ttc: totalTtc,
          total_tva: totalTva
        })
        .eq('id', id);
    }

    console.log(`✅ Produit ajouté à l'expédition ${id}`);

    return NextResponse.json({
      success: true,
      produit: shipmentProduit,
      message: 'Produit ajouté à l\'expédition avec succès'
    });

  } catch (error) {
    console.error(`Erreur ajout produit à shipment:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log(`🔄 PUT /shipments/${id}/produits - Mise à jour quantités`);
    const body = await request.json();

    const { produits } = body; // Array de { id, quantite_expediee }

    // Vérification que l'expédition existe et est modifiable
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('statut')
      .eq('id', id)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        { error: 'Expédition non trouvée' },
        { status: 404 }
      );
    }

    if (!['brouillon', 'En préparation', 'preparee'].includes(shipment.statut)) {
      return NextResponse.json(
        { error: 'Impossible de modifier les produits d\'une expédition déjà expédiée' },
        { status: 400 }
      );
    }

    // Mise à jour des quantités
    const updatePromises = produits.map((produit: { id: string; quantite_expediee: number }) =>
      supabase
        .from('shipment_produits')
        .update({ quantite_expediee: produit.quantite_expediee })
        .eq('id', produit.id)
        .eq('shipment_id', id)
    );

    const results = await Promise.all(updatePromises);

    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Erreurs mise à jour produits:', errors);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour des quantités' },
        { status: 500 }
      );
    }

    // Recalcul des totaux
    const { data: allProduits } = await supabase
      .from('shipment_produits')
      .select('quantite_expediee, prix_unitaire_ht, prix_unitaire_ttc')
      .eq('shipment_id', id);

    if (allProduits) {
      const totalHt = allProduits.reduce((sum, p) => sum + (p.prix_unitaire_ht * p.quantite_expediee), 0);
      const totalTtc = allProduits.reduce((sum, p) => sum + (p.prix_unitaire_ttc * p.quantite_expediee), 0);
      const totalTva = totalTtc - totalHt;

      await supabase
        .from('shipments')
        .update({
          total_ht: totalHt,
          total_ttc: totalTtc,
          total_tva: totalTva
        })
        .eq('id', id);
    }

    console.log(`✅ Quantités mises à jour pour l'expédition ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Quantités mises à jour avec succès'
    });

  } catch (error) {
    console.error(`Erreur mise à jour produits shipment:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}