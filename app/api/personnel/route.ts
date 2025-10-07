import { supabase } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/personnel - Liste du personnel
export async function GET() {
  try {
    const { data: personnel, error } = await supabase
      .from('personnel')
      .select('*')
      .order('nom', { ascending: true })

    if (error) {
      console.error('Erreur lors de la récupération du personnel:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du personnel' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: personnel || []
    })
  } catch (error) {
    console.error('Erreur API personnel GET:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}