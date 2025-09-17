import { extrabatSync } from '@/lib/extrabatSync';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pieceId: string }> },
) {
  try {
    const { pieceId } = await params;

    if (!pieceId) {
      return NextResponse.json(
        { error: 'ID pièce requis' },
        { status: 400 },
      );
    }

    const commande = await extrabatSync.fetchCommandeDetails(pieceId);

    return NextResponse.json({
      success: true,
      commande,
    });
  } catch (error) {
    console.error('Erreur API détail commande ExtraBat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}