import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ commandeId: string; produitId: string }> },
) {
  try {
    const { commandeId, produitId } = await params;

    if (!commandeId || !produitId) {
      return NextResponse.json(
        { error: 'ID commande et produit requis' },
        { status: 400 },
      );
    }

    const { data: produit, error } = await supabase
      .from('commande_produits')
      .select('*')
      .eq('id', produitId)
      .eq('commande_id', commandeId)
      .single();

    if (error) {
      console.error('Erreur récupération produit:', error);
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      produit,
    });
  } catch (error) {
    console.error('Erreur API produit:', error);
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
  { params }: { params: Promise<{ commandeId: string; produitId: string }> },
) {
  try {
    const { commandeId, produitId } = await params;
    const body = await request.json();

    if (!commandeId || !produitId) {
      return NextResponse.json(
        { error: 'ID commande et produit requis' },
        { status: 400 },
      );
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Seuls certains champs peuvent être mis à jour
    if (body.numero_serie !== undefined) updateData.numero_serie = body.numero_serie;
    if (body.quantite !== undefined) updateData.quantite = body.quantite;
    if (body.statut !== undefined) updateData.statut = body.statut;
    if (body.nom_produit !== undefined) updateData.nom_produit = body.nom_produit;
    if (body.code_produit !== undefined) updateData.code_produit = body.code_produit;

    const { data: produit, error } = await supabase
      .from('commande_produits')
      .update(updateData)
      .eq('id', produitId)
      .eq('commande_id', commandeId)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour produit:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du produit' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      produit,
    });
  } catch (error) {
    console.error('Erreur API mise à jour produit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commandeId: string; produitId: string }> },
) {
  try {
    const { commandeId, produitId } = await params;

    if (!commandeId || !produitId) {
      return NextResponse.json(
        { error: 'ID commande et produit requis' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('commande_produits')
      .delete()
      .eq('id', produitId)
      .eq('commande_id', commandeId);

    if (error) {
      console.error('Erreur suppression produit:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du produit' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur API suppression produit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}