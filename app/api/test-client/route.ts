import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Chercher le client BV - Bureau Vallée LA FLECHE
    const { data: clients, error } = await supabase
      .from('clients')
      .select('id, name, extrabat_id')
      .ilike('name', '%BV%Bureau%Vallée%LA%FLECHE%')
      .limit(5);

    if (error) {
      console.error('Erreur recherche client:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      clients: clients || [],
      message: `Trouvé ${clients?.length || 0} client(s)`,
    });
  } catch (error) {
    console.error('Erreur API test-client:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 },
    );
  }
}