import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('produits')
      .select(`
        id,
        code,
        libelle,
        description,
        prix,
        taux_tva,
        created_at,
        updated_at
      `)
      .order('libelle', { ascending: true });

    if (search) {
      query = query.or(`code.ilike.%${search}%,libelle.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: produits, error } = await query;

    if (error) {
      console.error('Erreur récupération produits:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      produits: produits || [],
      count: produits?.length || 0,
    });
  } catch (error) {
    console.error('Erreur API produits:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}