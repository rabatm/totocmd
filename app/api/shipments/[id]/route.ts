import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import { UpdateShipmentStatusInput } from '@/src/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log(`🔄 GET /shipments/${id}`);

    const { data: shipment, error } = await supabase
      .from('shipments')
      .select(`
        id,
        client,
        fa_bl_number,
        numero_facture,
        date_envoi,
        verificateur,
        preparateur,
        suivi_chronopost,
        observations,
        statut,
        commande_id,
        total_ht,
        total_ttc,
        total_tva,
        date_preparation,
        date_verification,
        transporteur,
        created_at,
        updated_at,
        commandes (
          id,
          numero_commande,
          client_id,
          total_ttc,
          clients (
            id,
            name,
            email,
            phone,
            address
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erreur récupération shipment:', error);
      return NextResponse.json(
        {
          error: 'Expédition non trouvée',
          details: error.message
        },
        { status: 404 }
      );
    }

    // Récupération des produits de l'expédition
    const { data: shipmentProduits, error: produitsError } = await supabase
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
          remarque
        )
      `)
      .eq('shipment_id', id);

    if (produitsError) {
      console.error('❌ Erreur récupération produits shipment:', produitsError);
    }

    const shipmentWithDetails = {
      ...shipment,
      shipment_produits: shipmentProduits || []
    };

    console.log(`✅ Expédition ${id} récupérée avec ${shipmentProduits?.length || 0} produits`);

    return NextResponse.json({
      success: true,
      shipment: shipmentWithDetails
    });

  } catch (error) {
    console.error(`Erreur récupération shipment:`, error);
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
    console.log(`🔄 PUT /shipments/${id} - Mise à jour`);
    const body: Partial<import('@/src/types').UpdateShipmentStatusInput & Record<string, unknown>> = await request.json();

    console.log('📦 Données de mise à jour:', body);

    const updateData: Record<string, unknown> = {
      statut: body.statut,
      updated_at: new Date().toISOString()
    };

    // Ajout des timestamps selon le statut
    if (body.statut === 'preparee' && body.date_preparation) {
      updateData.date_preparation = body.date_preparation;
    }

    if (body.statut === 'verifiee' && body.date_verification) {
      updateData.date_verification = body.date_verification;
    }

    if (body.observations !== undefined) {
      updateData.observations = body.observations;
    }

    // Gestion du numéro de facture et du suivi Chronopost
    if (body.numero_facture !== undefined) {
      updateData.numero_facture = body.numero_facture;
    }

    if (body.suivi_chronopost !== undefined) {
      updateData.suivi_chronopost = body.suivi_chronopost;
    }

    if (body.transporteur !== undefined) {
      updateData.transporteur = body.transporteur;
    }

    const { data: shipment, error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur mise à jour shipment:', error);
      return NextResponse.json(
        {
          error: 'Erreur lors de la mise à jour de l\'expédition',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Si l'expédition passe à "expediee", mettre à jour les produits de commande
    if (body.statut === 'expediee') {
      const { data: shipmentProduits, error: produitsError } = await supabase
        .from('shipment_produits')
        .select('commande_produit_id')
        .eq('shipment_id', id);

      if (!produitsError && shipmentProduits) {
        const commandeProduitIds = shipmentProduits.map(p => p.commande_produit_id);

        await supabase
          .from('commande_produits')
          .update({ statut: 'expedie' })
          .in('id', commandeProduitIds);

        console.log(`✅ ${commandeProduitIds.length} produits marqués comme expédiés`);
      }
    }

    console.log(`✅ Expédition ${id} mise à jour: ${body.statut}`);

    return NextResponse.json({
      success: true,
      shipment,
      message: `Expédition mise à jour: ${body.statut}`
    });

  } catch (error) {
    console.error(`Erreur mise à jour shipment:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log(`🔄 DELETE /shipments/${id}`);

    // Vérification du statut avant suppression
    const { data: shipment, error: getError } = await supabase
      .from('shipments')
      .select('statut')
      .eq('id', id)
      .single();

    if (getError || !shipment) {
      return NextResponse.json(
        { error: 'Expédition non trouvée' },
        { status: 404 }
      );
    }

    // Ne permet la suppression que si l'expédition est en brouillon ou en préparation
    if (!['brouillon', 'En préparation'].includes(shipment.statut)) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une expédition déjà traitée' },
        { status: 400 }
      );
    }

    // Suppression (les produits seront supprimés en cascade)
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur suppression shipment:', error);
      return NextResponse.json(
        {
          error: 'Erreur lors de la suppression de l\'expédition',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log(`✅ Expédition ${id} supprimée`);

    return NextResponse.json({
      success: true,
      message: 'Expédition supprimée avec succès'
    });

  } catch (error) {
    console.error(`Erreur suppression shipment:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}