import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commandeId: string }> },
) {
  try {
    const { commandeId } = await params;

    if (!commandeId) {
      return NextResponse.json(
        { error: 'ID commande requis' },
        { status: 400 },
      );
    }

    const { data: produits, error } = await supabase
      .from('commande_produits')
      .select(`
        id,
        commande_id,
        personnel_id,
        nom_produit,
        code_produit,
        numero_serie,
        quantite,
        statut,
        date_scan,
        created_at,
        updated_at
      `)
      .eq('commande_id', commandeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération produits commande:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      produits: produits || [],
      count: produits?.length || 0,
    });
  } catch (error) {
    console.error('Erreur API produits commande:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commandeId: string }> },
) {
  try {
    console.log('🔄 API POST /commandes/[commandeId]/produits appelée');
    const { commandeId } = await params;
    console.log(`📋 CommandeId: ${commandeId}`);

    const body = await request.json();
    console.log('📄 Body reçu:', JSON.stringify(body, null, 2));

    if (!commandeId) {
      return NextResponse.json(
        { error: 'ID commande requis' },
        { status: 400 },
      );
    }

    const {
      nom_produit,
      code_produit,
      numero_serie,
      quantite = 1,
      personnel_id = 1,
      statut = 'scanne'
    } = body;

    console.log('🔍 Validation des champs:', {
      nom_produit,
      numero_serie,
      code_produit,
      quantite,
      personnel_id,
      statut
    });

    if (!nom_produit || !numero_serie) {
      console.log('❌ Validation échouée: champs manquants');
      return NextResponse.json(
        { error: 'Nom produit et numéro série requis' },
        { status: 400 },
      );
    }

    console.log('🚀 Insertion dans la base de données...');
    const insertData = {
      commande_id: commandeId,
      personnel_id,
      nom_produit,
      code_produit,
      numero_serie,
      quantite,
      statut,
      date_scan: new Date().toISOString(),
    };
    console.log('📦 Données à insérer:', JSON.stringify(insertData, null, 2));

    const { data: produit, error } = await supabase
      .from('commande_produits')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur ajout produit commande:', error);
      console.error('❌ Détails erreur:', {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message
      });
      return NextResponse.json(
        {
          error: 'Erreur lors de l\'ajout du produit',
          details: error.message,
          code: error.code
        },
        { status: 500 },
      );
    }

    console.log('✅ Produit ajouté avec succès:', produit);

    return NextResponse.json({
      success: true,
      produit,
    });
  } catch (error) {
    console.error('Erreur API ajout produit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}