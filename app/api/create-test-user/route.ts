import { supabase } from '@/lib/supabaseClient';
import {  NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log("🔐 Création d'un utilisateur de test...");

    const testEmail = 'admin@test.com';
    const testPassword = 'test123456';

    // Vérifier la connexion Supabase
    console.log('📡 Test de connexion Supabase...');
    const { error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Erreur de connexion Supabase:', sessionError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de connexion Supabase',
          details: sessionError.message,
        },
        { status: 500 },
      );
    }

    console.log('✅ Connexion Supabase réussie');

    // Créer l'utilisateur de test
    console.log(`📧 Création de l'utilisateur: ${testEmail}`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      },
    );

    if (signUpError) {
      if (signUpError.message.includes('User already registered')) {
        console.log('✅ Utilisateur déjà existant');

        // Tester la connexion
        console.log('🔓 Test de connexion...');
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });

        if (signInError) {
          console.error('❌ Erreur de connexion:', signInError.message);
          return NextResponse.json(
            {
              success: false,
              error: 'Erreur de connexion avec utilisateur existant',
              details: signInError.message,
              credentials: { email: testEmail, password: testPassword },
            },
            { status: 400 },
          );
        } else {
          console.log('✅ Connexion réussie');
          console.log('👤 Utilisateur:', signInData.user?.email);

          return NextResponse.json({
            success: true,
            message: 'Utilisateur existant - connexion réussie',
            user: signInData.user?.email,
            credentials: { email: testEmail, password: testPassword },
          });
        }
      } else {
        console.error('❌ Erreur lors de la création:', signUpError.message);
        return NextResponse.json(
          {
            success: false,
            error: 'Erreur lors de la création',
            details: signUpError.message,
          },
          { status: 400 },
        );
      }
    } else {
      console.log('✅ Utilisateur créé avec succès');
      console.log('👤 Nouvel utilisateur:', signUpData.user?.email);

      let message = 'Utilisateur créé avec succès';
      if (signUpData.session) {
        console.log('🎯 Session créée automatiquement');
        message += ' - Session créée automatiquement';
      } else {
        console.log('📧 Email de confirmation nécessaire');
        message += ' - Email de confirmation nécessaire';
      }

      return NextResponse.json({
        success: true,
        message,
        user: signUpData.user?.email,
        credentials: { email: testEmail, password: testPassword },
        hasSession: !!signUpData.session,
      });
    }
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur inattendue',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Utilisez POST pour créer un utilisateur de test',
    credentials: {
      email: 'admin@test.com',
      password: 'test123456',
    },
  });
}
