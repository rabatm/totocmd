import { NextRequest, NextResponse } from 'next/server';
import { syncExtrabatClientsToSupabase } from '@/lib/syncExtrabatClients';

// POST /api/sync/clients - Synchroniser tous les clients depuis ExtraBat
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Démarrage de la synchronisation des clients...');

    const result = await syncExtrabatClientsToSupabase();

    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });

  } catch (error) {
    console.error('❌ Erreur API sync clients:', error);
    return NextResponse.json(
      {
        success: false,
        total: 0,
        inserted: 0,
        updated: 0,
        errors: 1,
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// GET /api/sync/clients - Vérifier le statut de la dernière synchronisation
export async function GET(request: NextRequest) {
  try {
    // TODO: Récupérer les infos de la dernière synchro depuis une table de logs
    return NextResponse.json({
      message: 'Endpoint de statut - à implémenter',
      lastSync: null
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
