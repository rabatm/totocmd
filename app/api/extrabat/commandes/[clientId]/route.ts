import { extrabatSync } from '@/lib/extrabatSync';
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

    const commandes = await extrabatSync.fetchCommandesByClient(clientId);

    return NextResponse.json({
      success: true,
      commandes,
    });
  } catch (error) {
    console.error('Erreur API commandes ExtraBat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}