import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getEnvVar(key: string): Promise<string> {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement ${key} manquante`);
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json();

    if (!searchTerm) {
      return NextResponse.json({ error: 'Terme de recherche requis' }, { status: 400 });
    }

    const supabaseUrl = await getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = await getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`🔍 Recherche Supabase: ${searchTerm}`);

    // Recherche dans Supabase
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,extrabat_id.ilike.%${searchTerm}%,id.eq.${searchTerm}`);

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Clients trouvés dans Supabase: ${clients?.length || 0}`);

    return NextResponse.json({
      success: true,
      count: clients?.length || 0,
      clients: clients || []
    });

  } catch (error) {
    console.error('❌ Erreur recherche Supabase:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false
      },
      { status: 500 }
    );
  }
}
