import { ExtrabatSyncService } from '@/lib/extrabatSync';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Initialiser le service de synchronisation
    const syncService = new ExtrabatSyncService();

    // Lancer la synchronisation
    const result = await syncService.syncProduitsToSupabase();

    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée avec succès',
      data: result,
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}
