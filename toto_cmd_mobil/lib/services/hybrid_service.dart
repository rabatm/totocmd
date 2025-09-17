import 'dart:developer' as developer;
import 'api_service.dart';
import 'supabase_service.dart';
import '../models/models.dart';

class HybridService {
  // Service hybride qui utilise l'API Next.js pour ExtraBat et Supabase pour les données locales

  // ============ GESTION COMMANDES EXTRABAT VIA API ============

  // Récupérer les commandes ExtraBat d'un client via l'API Next.js
  static Future<List<ExtrabatCommande>> getCommandesExtraBat(String clientId) async {
    return await ApiService.getCommandesExtraBat(clientId);
  }

  // Récupérer une commande ExtraBat via l'API Next.js
  static Future<ExtrabatCommande?> getCommandeExtraBat(String pieceId) async {
    return await ApiService.getCommandeExtraBat(pieceId);
  }

  // Importer une commande ExtraBat via l'API Next.js
  static Future<Map<String, dynamic>?> importCommandeExtraBat(String pieceId) async {
    return await ApiService.importCommandeExtraBat(pieceId);
  }

  // Synchroniser les produits ExtraBat via l'API Next.js
  static Future<Map<String, dynamic>?> syncProduits() async {
    return await ApiService.syncProduits();
  }

  // ============ GESTION DONNÉES LOCALES VIA SUPABASE ============

  // Récupérer toutes les commandes locales
  static Future<List<Commande>> getCommandes() async {
    return await SupabaseService.getCommandes();
  }

  // Récupérer une commande locale par ID
  static Future<Commande?> getCommandeById(String id) async {
    return await SupabaseService.getCommandeById(id);
  }

  // Rechercher des commandes locales
  static Future<List<Commande>> searchCommandes(String query) async {
    return await SupabaseService.searchCommandes(query);
  }

  // Récupérer tous les produits locaux
  static Future<List<Produit>> getProduits() async {
    return await SupabaseService.getProduits();
  }

  // Rechercher un produit par code
  static Future<Produit?> getProduitByCode(String code) async {
    return await SupabaseService.getProduitByCode(code);
  }

  // Ajouter un produit à une commande locale
  static Future<CommandeProduit> addProduitToCommande({
    required String commandeId,
    required int produitId,
    required String nomProduit,
    required String numeroSerie,
    String? codeProduit,
    int quantite = 1,
    int personnelId = 1,
  }) async {
    return await SupabaseService.addProduitToCommande(
      commandeId: commandeId,
      produitId: produitId,
      nomProduit: nomProduit,
      numeroSerie: numeroSerie,
      codeProduit: codeProduit,
      quantite: quantite,
      personnelId: personnelId,
    );
  }

  // Récupérer les produits d'une commande locale
  static Future<List<CommandeProduit>> getCommandeProduits(String commandeId) async {
    return await SupabaseService.getCommandeProduits(commandeId);
  }

  // ============ FONCTIONS UTILITAIRES ============

  // Tester la connexion à l'API
  static Future<bool> testApiConnection() async {
    return await ApiService.testConnection();
  }

  // Initialiser Supabase
  static Future<void> initializeSupabase() async {
    await SupabaseService.initialize();
  }

  // ============ WORKFLOW HYBRIDE ============

  // Workflow complet : importer une commande ExtraBat et la préparer localement
  static Future<Map<String, dynamic>> processCommandeExtraBat(String pieceId) async {
    try {
      developer.log('🔄 Traitement de la commande ExtraBat $pieceId', name: 'HybridService');

      // 1. Récupérer la commande depuis ExtraBat via l'API
      final extrabatCommande = await getCommandeExtraBat(pieceId);
      if (extrabatCommande == null) {
        throw Exception('Commande ExtraBat non trouvée');
      }

      // 2. Importer la commande dans le système local via l'API
      final importResult = await importCommandeExtraBat(pieceId);
      if (importResult == null || importResult['success'] != true) {
        throw Exception('Échec de l\'import de la commande');
      }

      // 3. Récupérer la commande importée depuis la base locale
      final commandeLocale = await getCommandeById(importResult['commande']['id']);

      developer.log('✅ Commande ExtraBat traitée avec succès', name: 'HybridService');

      return {
        'success': true,
        'extrabatCommande': extrabatCommande,
        'commandeLocale': commandeLocale,
        'importResult': importResult,
      };
    } catch (e) {
      developer.log('❌ Erreur lors du traitement de la commande ExtraBat: $e', name: 'HybridService', error: e);
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  // Synchronisation complète : produits + commandes
  static Future<Map<String, dynamic>> fullSync() async {
    try {
      developer.log('🔄 Synchronisation complète', name: 'HybridService');

      // 1. Synchroniser les produits depuis ExtraBat
      final syncProduitsResult = await syncProduits();

      // 2. Récupérer les produits locaux mis à jour
      final produits = await getProduits();

      // 3. Récupérer les commandes locales
      final commandes = await getCommandes();

      developer.log('✅ Synchronisation complète terminée', name: 'HybridService');

      return {
        'success': true,
        'syncProduits': syncProduitsResult,
        'produitsCount': produits.length,
        'commandesCount': commandes.length,
      };
    } catch (e) {
      developer.log('❌ Erreur lors de la synchronisation complète: $e', name: 'HybridService', error: e);
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }
}