import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  try {
    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { error: 'ID client requis' },
        { status: 400 },
      );
    }

    // Récupérer le client depuis Supabase
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, name, email, phone, address, city, postal_code, country, extrabat_id')
      .eq('id', clientId)
      .single();

    if (error) {
      console.error('Erreur récupération client:', error);
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 },
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 },
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Erreur API client:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}