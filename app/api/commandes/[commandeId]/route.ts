import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
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

    // Récupérer la commande et ses produits en parallèle
    const [commandeResult, produitsResult] = await Promise.all([
      supabase
        .from('commandes')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone,
            address
          )
        `)
        .eq('id', commandeId)
        .single(),
      supabase
        .from('commande_produits')
        .select('*')
        .eq('commande_id', commandeId)
    ]);

    const { data: commande, error } = commandeResult;
    const { data: produits, error: produitsError } = produitsResult;

    if (error) {
      console.error('Erreur récupération commande:', error);
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 },
      );
    }

    if (produitsError) {
      console.error('Erreur récupération produits:', produitsError);
      // Continue même si les produits ne se chargent pas
    }

    // Ajouter les produits à la commande
    const commandeWithProduits = {
      ...commande,
      commande_produits: produits || []
    };

    return NextResponse.json({
      success: true,
      commande: commandeWithProduits,
    });
  } catch (error) {
    console.error('Erreur API commande:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commandeId: string }> },
) {
  try {
    const { commandeId } = await params;
    const body = await request.json();

    if (!commandeId) {
      return NextResponse.json(
        { error: 'ID commande requis' },
        { status: 400 },
      );
    }

    const { data: commande, error } = await supabase
      .from('commandes')
      .update({
        etat: body.etat,
        progression: body.progression,
        remarque: body.remarque,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commandeId)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour commande:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      commande,
    });
  } catch (error) {
    console.error('Erreur API mise à jour commande:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}