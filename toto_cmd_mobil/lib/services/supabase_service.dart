import 'dart:developer' as developer;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/models.dart';
import '../config/env_config.dart';

class SupabaseService {
  static String get supabaseUrl => EnvConfig.supabaseUrl;
  static String get supabaseAnonKey => EnvConfig.supabaseAnonKey;

  static SupabaseClient? _client;

  static Future<void> initialize() async {
    try {
      developer.log('🔄 Initialisation de Supabase...', name: 'SupabaseService');
      await Supabase.initialize(
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      );
      _client = Supabase.instance.client;
      developer.log('✅ Supabase initialisé avec succès', name: 'SupabaseService');
    } catch (e) {
      developer.log('❌ Erreur lors de l\'initialisation de Supabase: $e', name: 'SupabaseService', error: e);
      rethrow;
    }
  }

  static SupabaseClient get client {
    if (_client == null) {
      throw Exception('Supabase client not initialized. Call initialize() first.');
    }
    return _client!;
  }

  // Récupérer toutes les commandes
  static Future<List<Commande>> getCommandes() async {
    try {
      developer.log('🔄 Récupération des commandes depuis la table "commandes"...', name: 'SupabaseService');
      final response = await client
          .from('commandes')
          .select('*, clients(*), commande_produits(*)')
          .order('created_at', ascending: false);

      developer.log('✅ ${response.length} commandes récupérées', name: 'SupabaseService');
      // Log détaillé des commandes récupérées
      for (var i = 0; i < response.length; i++) {
        var cmd = response[i];
        developer.log('📋 Commande ${i+1}: ${cmd['numero_commande']} - Client: ${cmd['clients']?['name'] ?? 'N/A'} - Produits: ${cmd['commande_produits']?.length ?? 0}', name: 'SupabaseService');
      }
      return response.map((json) => Commande.fromJson(json)).toList();
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération des commandes: $e', name: 'SupabaseService', error: e);
      throw Exception('Erreur lors de la récupération des commandes: $e');
    }
  }

  // Récupérer une commande par ID
  static Future<Commande?> getCommandeById(String id) async {
    try {
      developer.log('🔄 Récupération de la commande ID: $id', name: 'SupabaseService');
      final response = await client
          .from('commandes')
          .select('*, clients(*), commande_produits(*)')
          .eq('id', id)
          .single();

      developer.log('✅ Commande récupérée: ${response['numero_commande']}', name: 'SupabaseService');
      return Commande.fromJson(response);
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération de la commande $id: $e', name: 'SupabaseService', error: e);
      throw Exception('Erreur lors de la récupération de la commande: $e');
    }
  }

  // Rechercher des commandes par numéro
  static Future<List<Commande>> searchCommandes(String query) async {
    try {
      developer.log('🔄 Recherche de commandes avec query: "$query"', name: 'SupabaseService');
      final response = await client
          .from('commandes')
          .select('*, clients(*)')
          .ilike('numero_commande', '%$query%')
          .order('created_at', ascending: false)
          .limit(20);

      developer.log('✅ ${response.length} commandes trouvées pour "$query"', name: 'SupabaseService');
      return response.map((json) => Commande.fromJson(json)).toList();
    } catch (e) {
      developer.log('❌ Erreur lors de la recherche des commandes: $e', name: 'SupabaseService', error: e);
      throw Exception('Erreur lors de la recherche des commandes: $e');
    }
  }

  // Récupérer tous les produits
  static Future<List<Produit>> getProduits() async {
    try {
      developer.log('🔄 Récupération des produits depuis la table "produits"...', name: 'SupabaseService');
      final response = await client
          .from('produits')
          .select('*')
          .eq('archived', false)
          .order('libelle');

      developer.log('✅ ${response.length} produits récupérés', name: 'SupabaseService');
      // Log détaillé des produits récupérés
      for (var i = 0; i < response.length && i < 5; i++) { // Limiter aux 5 premiers pour éviter trop de logs
        var prod = response[i];
        developer.log('📦 Produit ${i+1}: ${prod['libelle']} (Code: ${prod['code']})', name: 'SupabaseService');
      }
      return response.map((json) => Produit.fromJson(json)).toList();
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération des produits: $e', name: 'SupabaseService', error: e);
      throw Exception('Erreur lors de la récupération des produits: $e');
    }
  }

  // Rechercher un produit par code ou code-barre
  static Future<Produit?> getProduitByCode(String code) async {
    try {
      developer.log('🔄 Recherche du produit avec code: "$code"', name: 'SupabaseService');
      final response = await client
          .from('produits')
          .select('*')
          .or('code.eq.$code,code_barre.eq.$code')
          .eq('archived', false)
          .single();

      developer.log('✅ Produit trouvé: ${response['libelle']}', name: 'SupabaseService');
      return Produit.fromJson(response);
    } catch (e) {
      developer.log('❌ Produit non trouvé ou erreur: $e', name: 'SupabaseService', error: e);
      return null; // Produit non trouvé
    }
  }

  // Ajouter un produit à une commande
  static Future<CommandeProduit> addProduitToCommande({
    required String commandeId,
    required int produitId,
    required String nomProduit,
    required String numeroSerie,
    String? codeProduit,
    int quantite = 1,
    int personnelId = 1, // ID par défaut, à adapter selon l'utilisateur connecté
  }) async {
    try {
      developer.log('🔄 Ajout du produit "$nomProduit" à la commande $commandeId', name: 'SupabaseService');
      final now = DateTime.now().toIso8601String();

      final response = await client
          .from('commande_produits')
          .insert({
            'commande_id': commandeId,
            'personnel_id': personnelId,
            'nom_produit': nomProduit,
            'code_produit': codeProduit,
            'numero_serie': numeroSerie,
            'quantite': quantite,
            'statut': CommandeProduit.scanned,
            'date_scan': now,
          })
          .select()
          .single();

      developer.log('✅ Produit ajouté avec succès à la commande', name: 'SupabaseService');
      return CommandeProduit.fromJson(response);
    } catch (e) {
      developer.log('❌ Erreur lors de l\'ajout du produit à la commande: $e', name: 'SupabaseService', error: e);
      throw Exception('Erreur lors de l\'ajout du produit à la commande: $e');
    }
  }

  // Récupérer les produits d'une commande
  static Future<List<CommandeProduit>> getCommandeProduits(String commandeId) async {
    try {
      developer.log('🔄 Récupération des produits de la commande $commandeId', name: 'SupabaseService');
      final response = await client
          .from('commande_produits')
          .select('*')
          .eq('commande_id', commandeId)
          .order('created_at', ascending: false);

      developer.log('✅ ${response.length} produits récupérés pour la commande $commandeId', name: 'SupabaseService');
      return response.map((json) => CommandeProduit.fromJson(json)).toList();
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération des produits de la commande: $e', name: 'SupabaseService', error: e);
      throw Exception('Erreur lors de la récupération des produits de la commande: $e');
    }
  }
}