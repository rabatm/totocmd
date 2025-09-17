import { extrabatSync } from '@/lib/extrabatSync';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pieceId, localClientId } = body;

    if (!pieceId || !localClientId) {
      return NextResponse.json(
        { error: 'pieceId et localClientId requis' },
        { status: 400 },
      );
    }

    const result = await extrabatSync.importCommandeFromExtrabat(
      pieceId,
      localClientId,
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Commande importée avec succès',
        commandeId: result.commandeId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Erreur API import commande:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}