import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function showInstructions() {
  console.log('🔄 Script pour insérer des données de test dans Supabase');
  console.log('');
  console.log('📋 Instructions:');
  console.log('1. Ouvrez votre dashboard Supabase: https://supabase.com/dashboard/project/wsrcjuknxapuxifhdrfb/sql');
  console.log('2. Copiez le contenu du fichier test-stock-en-commande.sql');
  console.log('3. Collez-le dans l\'éditeur SQL et exécutez-le');
  console.log('');
  console.log('📄 Contenu du fichier SQL:');
  console.log('='.repeat(50));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const sqlPath = path.join(process.cwd(), 'test-stock-en-commande.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log(sqlContent);

    console.log('='.repeat(50));
    // Diviser le SQL en statements individuels (basé sur les points-virgules)

    console.log('');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log('🎯 Ce script va créer:');
    console.log('• Des produits avec stock physique');
    console.log('• Des commandes de test (en_attente, en_cours)');
    console.log('• Des produits scannés dans ces commandes');

    console.log('');
    console.log(`📄 ${statements.length} statements SQL à exécuter`);

    console.log('✅ Après exécution, vérifiez la page stocks pour voir la colonne "Stock en commande clients"');

    // Exécuter chaque statement via l'API Supabase
    // Note: Supabase ne permet pas d'exécuter du SQL arbitraire via l'API publique

    console.log('⚠️ Note: Pour des raisons de sécurité, Supabase ne permet pas l\'exécution de SQL arbitraire via l\'API publique.');
    console.log('📋 Veuillez copier le contenu du fichier test-stock-en-commande.sql et l\'exécuter dans l\'éditeur SQL de Supabase.');
    console.log('🔗 URL: https://supabase.com/dashboard/project/wsrcjuknxapuxifhdrfb/sql');

  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script:', error);
  }
}

async function runTestDataScript() {
  console.log('🔄 Exécution du script de données de test...');
  showInstructions();
}

runTestDataScript();