import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateSettingInput } from '@/src/types';

// GET /api/settings - Récupérer tous les paramètres
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let query = supabase
      .from('app_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des paramètres' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: settings || [],
    });
  } catch (error) {
    console.error('Erreur API settings GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/settings - Créer un nouveau paramètre
export async function POST(request: NextRequest) {
  try {
    const body: CreateSettingInput = await request.json();

    const { data: setting, error } = await supabase
      .from('app_settings')
      .insert({
        key: body.key,
        value: body.value || null,
        description: body.description || null,
        is_encrypted: body.is_encrypted || false,
        category: body.category || 'general',
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du paramètre:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du paramètre' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: setting,
    });
  } catch (error) {
    console.error('Erreur API settings POST:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
