import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 API /commandes appelée');
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    console.log(`📋 Paramètres: search="${search}", limit="${limit}"`);

    console.log('📊 Construction de la requête Supabase...');

    let query = supabase
      .from('commandes')
      .select(`
        id,
        numero_commande,
        client_id,
        date_commande,
        date_limite_expedition,
        total_ttc,
        total_ht,
        etat,
        progression,
        remarque,
        created_at,
        clients (
          id,
          name,
          email,
          phone
        )
      `)
      .not('etat', 'in', '(expedie,annule)') // ✅ Exclure les commandes expédiées et annulées
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`numero_commande.ilike.%${search}%,clients.name.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    console.log('🚀 Exécution de la requête Supabase...');
    const { data: commandes, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération commandes:', error);
      console.error('❌ Détails erreur:', {
        code: error.code,
        details: error.details,
        hint: error.hint,
        message: error.message
      });
      return NextResponse.json(
        {
          error: 'Erreur lors de la récupération des commandes',
          details: error.message,
          code: error.code
        },
        { status: 500 },
      );
    }

    console.log(`✅ ${commandes?.length || 0} commandes récupérées`);

    return NextResponse.json({
      success: true,
      commandes: commandes || [],
      count: commandes?.length || 0,
    });
  } catch (error) {
    console.error('Erreur API commandes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}