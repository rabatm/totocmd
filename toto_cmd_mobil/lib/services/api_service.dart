import 'dart:convert';
import 'dart:developer' as developer;
import 'package:http/http.dart' as http;
import '../models/models.dart';
import '../config/env_config.dart';

class ApiService {
  // URL de base de l'API Next.js
  static String get baseUrl => EnvConfig.apiBaseUrl;

  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Helper pour gérer les réponses HTTP
  static Map<String, dynamic> _handleResponse(http.Response response) {
    developer.log('API Response: ${response.statusCode} - ${response.body}', name: 'ApiService');

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      return json.decode(response.body);
    } else {
      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }

  // Récupérer les informations d'un client
  static Future<Map<String, dynamic>?> getClient(String clientId) async {
    try {
      developer.log('🔄 Récupération du client $clientId depuis l\'API Next.js', name: 'ApiService');

      final response = await http.get(
        Uri.parse('$baseUrl/clients/$clientId'),
        headers: _headers,
      );

      final data = _handleResponse(response);
      developer.log('✅ Client récupéré: ${data['name']}', name: 'ApiService');
      return data;
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération du client: $e', name: 'ApiService', error: e);
      return null;
    }
  }

  // Récupérer les commandes ExtraBat d'un client
  static Future<List<ExtrabatCommande>> getCommandesExtraBat(String clientId) async {
    try {
      developer.log('🔄 Récupération des commandes ExtraBat pour le client $clientId', name: 'ApiService');

      final response = await http.get(
        Uri.parse('$baseUrl/extrabat/commandes/$clientId'),
        headers: _headers,
      );

      final data = _handleResponse(response);

      if (data['success'] == true && data['commandes'] != null) {
        final commandesData = List<Map<String, dynamic>>.from(data['commandes']);
        final commandes = commandesData.map((cmd) => ExtrabatCommande.fromJson(cmd)).toList();
        developer.log('✅ ${commandes.length} commandes ExtraBat récupérées', name: 'ApiService');
        return commandes;
      }

      return [];
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération des commandes ExtraBat: $e', name: 'ApiService', error: e);
      return [];
    }
  }

  // Récupérer une commande ExtraBat spécifique
  static Future<ExtrabatCommande?> getCommandeExtraBat(String pieceId) async {
    try {
      developer.log('🔄 Récupération de la commande ExtraBat $pieceId', name: 'ApiService');

      final response = await http.get(
        Uri.parse('$baseUrl/extrabat/commande/$pieceId'),
        headers: _headers,
      );

      final data = _handleResponse(response);

      if (data['success'] == true && data['commande'] != null) {
        final commande = ExtrabatCommande.fromJson(data['commande']);
        developer.log('✅ Commande ExtraBat récupérée: ${commande.numero}', name: 'ApiService');
        return commande;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération de la commande ExtraBat: $e', name: 'ApiService', error: e);
      return null;
    }
  }

  // Importer une commande depuis ExtraBat
  static Future<Map<String, dynamic>?> importCommandeExtraBat(String pieceId) async {
    try {
      developer.log('🔄 Import de la commande ExtraBat $pieceId', name: 'ApiService');

      final response = await http.post(
        Uri.parse('$baseUrl/import-commande-extrabat'),
        headers: _headers,
        body: json.encode({'pieceId': pieceId}),
      );

      final data = _handleResponse(response);

      if (data['success'] == true) {
        developer.log('✅ Commande ExtraBat importée avec succès', name: 'ApiService');
        return data;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de l\'import de la commande ExtraBat: $e', name: 'ApiService', error: e);
      return null;
    }
  }

  // Tester la connexion API
  static Future<bool> testConnection() async {
    try {
      developer.log('🔄 Test de connexion à l\'API Next.js', name: 'ApiService');

      final response = await http.get(
        Uri.parse('$baseUrl/test-client'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        developer.log('✅ Connexion API réussie', name: 'ApiService');
        return true;
      }

      return false;
    } catch (e) {
      developer.log('❌ Erreur de connexion API: $e', name: 'ApiService', error: e);
      return false;
    }
  }

  // Synchroniser les produits depuis ExtraBat
  static Future<Map<String, dynamic>?> syncProduits() async {
    try {
      developer.log('🔄 Synchronisation des produits depuis ExtraBat', name: 'ApiService');

      final response = await http.post(
        Uri.parse('$baseUrl/sync-produits'),
        headers: _headers,
      );

      final data = _handleResponse(response);

      if (data['success'] == true) {
        developer.log('✅ Produits synchronisés avec succès', name: 'ApiService');
        return data;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de la sync des produits: $e', name: 'ApiService', error: e);
      return null;
    }
  }
}