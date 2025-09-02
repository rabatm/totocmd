require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables d'environnement Supabase manquantes");
  console.log('Vérifiez que vous avez bien configuré :');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log("🔐 Création d'un utilisateur de test...");

  const testEmail = 'test@totocmd.com';
  const testPassword = 'test123456';

  try {
    // Vérifier la connexion Supabase
    console.log('📡 Test de connexion Supabase...');
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error.message);
      return;
    }

    console.log('✅ Connexion Supabase réussie');

    // Créer l'utilisateur de test
    console.log(`📧 Création de l'utilisateur: ${testEmail}`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      }
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
        } else {
          console.log('✅ Connexion réussie');
          console.log('👤 Utilisateur:', signInData.user?.email);
        }
      } else {
        console.error('❌ Erreur lors de la création:', signUpError.message);
      }
    } else {
      console.log('✅ Utilisateur créé avec succès');
      console.log('👤 Nouvel utilisateur:', signUpData.user?.email);

      if (signUpData.session) {
        console.log('🎯 Session créée automatiquement');
      } else {
        console.log('📧 Email de confirmation nécessaire');
      }
    }

    console.log('\n📋 Identifiants de test:');
    console.log(`Email: ${testEmail}`);
    console.log(`Mot de passe: ${testPassword}`);
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
createTestUser();
