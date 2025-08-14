#!/usr/bin/env node

/**
 * Script de test pour la synchronisation Extrabat
 * Usage: node scripts/test-sync.js
 */

import { ExtrabatSyncService } from '../lib/extrabatSync.js';

async function testSync() {
  console.log('🚀 Test de synchronisation Extrabat...\n');

  try {
    const syncService = new ExtrabatSyncService();

    console.log('📡 Récupération des articles depuis Extrabat...');
    const articles = await syncService.fetchArticlesFromExtrabat();

    console.log(`✅ ${articles.length} articles récupérés\n`);

    // Afficher quelques exemples
    if (articles.length > 0) {
      console.log("📋 Exemples d'articles récupérés:");
      articles.slice(0, 3).forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.libelle} (${article.code})`);
        console.log(`   Prix: ${article.prix}€`);
        console.log(`   Famille: ${article.famille?.libelle || 'N/A'}`);
        console.log(`   Stock: ${article.tenueStock ? 'Oui' : 'Non'}`);
      });
    }

    console.log('\n🔄 Transformation des données...');
    const transformedProducts = articles.map(article =>
      syncService.transformExtrabatProduit(article)
    );

    console.log(`✅ ${transformedProducts.length} produits transformés\n`);

    // Afficher quelques exemples transformés
    if (transformedProducts.length > 0) {
      console.log('🔧 Exemples de produits transformés:');
      transformedProducts.slice(0, 2).forEach((produit, index) => {
        console.log(`\n${index + 1}. ${produit.libelle} (${produit.code})`);
        console.log(`   ID: ${produit.id}`);
        console.log(`   Prix: ${produit.prix}€`);
        console.log(`   Famille ID: ${produit.famille_id}`);
        console.log(`   Famille: ${produit.famille_libelle}`);
        console.log(`   Tenue stock: ${produit.tenue_stock}`);
        console.log(`   Archivé: ${produit.archived}`);
        console.log(`   Manuel: ${produit.is_manuel}`);
      });
    }

    console.log('\n💾 Test de synchronisation vers Supabase...');
    const result = await syncService.syncProduitsToSupabase();

    console.log(`\n✅ Synchronisation terminée avec succès !`);
    console.log(`📊 Résultat: ${JSON.stringify(result, null, 2)}`);
  } catch (error) {
    console.error('\n❌ Erreur lors du test de synchronisation:');
    console.error(error.message);

    if (error.cause) {
      console.error('\nCause:', error.cause);
    }

    process.exit(1);
  }
}

// Vérifier les variables d'environnement
function checkEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'EXTRABAT_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Variables d'environnement manquantes:");
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nVeuillez créer un fichier .env.local avec ces variables.');
    process.exit(1);
  }
}

// Point d'entrée principal
async function main() {
  console.log("🔍 Vérification de l'environnement...");
  checkEnvironment();
  console.log("✅ Variables d'environnement OK\n");

  await testSync();
}

// Exécuter si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
