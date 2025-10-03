import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateSettingInput } from '@/src/types';

// GET /api/settings/[key] - Récupérer un paramètre par sa clé
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { data: setting, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', params.key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Paramètre non trouvé' },
          { status: 404 }
        );
      }
      console.error('Erreur lors de la récupération du paramètre:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du paramètre' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: setting,
    });
  } catch (error) {
    console.error('Erreur API settings GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/settings/[key] - Mettre à jour un paramètre
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body: UpdateSettingInput = await request.json();

    const { data: setting, error } = await supabase
      .from('app_settings')
      .update({
        value: body.value,
        updated_at: new Date().toISOString(),
      })
      .eq('key', params.key)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du paramètre:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du paramètre' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: setting,
    });
  } catch (error) {
    console.error('Erreur API settings PUT:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/[key] - Supprimer un paramètre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { error } = await supabase
      .from('app_settings')
      .delete()
      .eq('key', params.key);

    if (error) {
      console.error('Erreur lors de la suppression du paramètre:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du paramètre' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Paramètre supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur API settings DELETE:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
