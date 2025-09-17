import 'dart:convert';
import 'dart:developer' as developer;
import 'package:http/http.dart' as http;
import '../models/models.dart';
import '../config/env_config.dart';

class CommandeService {
  static String get baseUrl {
    final url = EnvConfig.apiBaseUrl;
    developer.log('🔧 Base URL: $url', name: 'CommandeService');
    if (url.isEmpty || url == 'null') {
      developer.log('⚠️ URL vide ou null, utilisation de fallback', name: 'CommandeService');
      return 'http://192.168.1.62:3000/api'; // URL de fallback
    }
    return url;
  }

  static const Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  static Map<String, dynamic> _handleResponse(http.Response response, {String? url}) {
    developer.log('API Request URL: $url', name: 'CommandeService');
    developer.log('API Response: ${response.statusCode} - ${response.body}', name: 'CommandeService');

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return {};
      try {
        return json.decode(response.body);
      } catch (e) {
        developer.log('❌ Erreur parsing JSON: $e', name: 'CommandeService');
        developer.log('Body reçu: ${response.body}', name: 'CommandeService');
        throw Exception('Erreur parsing JSON: $e');
      }
    } else {
      developer.log('❌ API Error ${response.statusCode} for URL: $url', name: 'CommandeService');
      developer.log('❌ Error body: ${response.body}', name: 'CommandeService');

      // Essayer de parser l'erreur pour avoir plus de détails
      try {
        final errorData = json.decode(response.body);
        if (errorData['error'] != null) {
          throw Exception('API Error: ${errorData['error']}');
        }
      } catch (e) {
        // Si on ne peut pas parser l'erreur, utiliser le message original
      }

      throw Exception('API Error: ${response.statusCode} - ${response.body}');
    }
  }

  // ============ GESTION DES COMMANDES ============

  // Récupérer toutes les commandes
  static Future<List<Commande>> getCommandes({String? search, int? limit}) async {
    try {
      developer.log('🔄 Récupération des commandes', name: 'CommandeService');

      String url = '$baseUrl/commandes';
      List<String> queryParams = [];

      if (search != null && search.isNotEmpty) {
        queryParams.add('search=${Uri.encodeComponent(search)}');
      }
      if (limit != null) {
        queryParams.add('limit=$limit');
      }

      if (queryParams.isNotEmpty) {
        url += '?${queryParams.join('&')}';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      final data = _handleResponse(response, url: url);

      if (data['success'] == true && data['commandes'] != null) {
        final commandesData = List<Map<String, dynamic>>.from(data['commandes']);
        final commandes = commandesData.map((cmd) => Commande.fromJson(cmd)).toList();
        developer.log('✅ ${commandes.length} commandes récupérées', name: 'CommandeService');
        return commandes;
      }

      return [];
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération des commandes: $e', name: 'CommandeService', error: e);

      // Meilleur message d'erreur selon le type d'erreur
      if (e.toString().contains('404')) {
        throw Exception('API non disponible. Vérifiez que le serveur Next.js est démarré sur ${EnvConfig.apiBaseUrl}');
      } else if (e.toString().contains('SocketException') || e.toString().contains('Connection')) {
        throw Exception('Impossible de se connecter à l\'API. Vérifiez votre connexion réseau et l\'URL: ${EnvConfig.apiBaseUrl}');
      }

      rethrow;
    }
  }

  // Récupérer une commande par ID
  static Future<Commande?> getCommandeById(String commandeId) async {
    try {
      developer.log('🔄 Récupération de la commande $commandeId', name: 'CommandeService');

      final url = '$baseUrl/commandes/$commandeId';
      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      final data = _handleResponse(response, url: url);

      if (data['success'] == true && data['commande'] != null) {
        final commande = Commande.fromJson(data['commande']);
        developer.log('✅ Commande récupérée: ${commande.numeroCommande}', name: 'CommandeService');
        return commande;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération de la commande: $e', name: 'CommandeService', error: e);
      rethrow;
    }
  }

  // Mettre à jour une commande
  static Future<Commande?> updateCommande(String commandeId, {
    String? etat,
    double? progression,
    String? remarque,
  }) async {
    try {
      developer.log('🔄 Mise à jour de la commande $commandeId', name: 'CommandeService');

      final updateData = <String, dynamic>{};
      if (etat != null) updateData['etat'] = etat;
      if (progression != null) updateData['progression'] = progression;
      if (remarque != null) updateData['remarque'] = remarque;

      final response = await http.put(
        Uri.parse('$baseUrl/commandes/$commandeId'),
        headers: _headers,
        body: json.encode(updateData),
      );

      final data = _handleResponse(response);

      if (data['success'] == true && data['commande'] != null) {
        final commande = Commande.fromJson(data['commande']);
        developer.log('✅ Commande mise à jour', name: 'CommandeService');
        return commande;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de la mise à jour de la commande: $e', name: 'CommandeService', error: e);
      rethrow;
    }
  }

  // ============ GESTION DES PRODUITS ============

  // Récupérer la liste des produits
  static Future<List<Produit>> getProduits({String? search, int? limit}) async {
    try {
      developer.log('🔄 Récupération des produits', name: 'CommandeService');

      String url = '$baseUrl/produits';
      List<String> queryParams = [];

      if (search != null && search.isNotEmpty) {
        queryParams.add('search=${Uri.encodeComponent(search)}');
      }
      if (limit != null) {
        queryParams.add('limit=$limit');
      }

      if (queryParams.isNotEmpty) {
        url += '?${queryParams.join('&')}';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      final data = _handleResponse(response, url: url);

      if (data['success'] == true && data['produits'] != null) {
        final produitsData = List<Map<String, dynamic>>.from(data['produits']);
        final produits = produitsData.map((prod) => Produit.fromJson(prod)).toList();
        developer.log('✅ ${produits.length} produits récupérés', name: 'CommandeService');
        return produits;
      }

      return [];
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération des produits: $e', name: 'CommandeService', error: e);

      if (e.toString().contains('404')) {
        throw Exception('API non disponible. Vérifiez que le serveur Next.js est démarré sur ${EnvConfig.apiBaseUrl}');
      } else if (e.toString().contains('SocketException') || e.toString().contains('Connection')) {
        throw Exception('Impossible de se connecter à l\'API. Vérifiez votre connexion réseau et l\'URL: ${EnvConfig.apiBaseUrl}');
      }

      rethrow;
    }
  }

  // ============ GESTION DES PRODUITS DE COMMANDE ============

  // Récupérer tous les produits d'une commande
  static Future<List<CommandeProduit>> getCommandeProduits(String commandeId) async {
    try {
      developer.log('🔄 Récupération des produits de la commande $commandeId', name: 'CommandeService');

      final url = '$baseUrl/commandes/$commandeId/produits';
      final response = await http.get(
        Uri.parse(url),
        headers: _headers,
      );

      final data = _handleResponse(response, url: url);

      if (data['success'] == true && data['produits'] != null) {
        final produitsData = List<Map<String, dynamic>>.from(data['produits']);
        final produits = produitsData.map((prod) => CommandeProduit.fromJson(prod)).toList();
        developer.log('✅ ${produits.length} produits récupérés', name: 'CommandeService');
        return produits;
      }

      return [];
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération des produits: $e', name: 'CommandeService', error: e);
      rethrow;
    }
  }

  // Ajouter un produit à une commande
  static Future<CommandeProduit?> addProduitToCommande(
    String commandeId, {
    required String nomProduit,
    required String numeroSerie,
    String? codeProduit,
    int quantite = 1,
    int personnelId = 1,
    String statut = 'scanne',
  }) async {
    try {
      developer.log('🔄 Ajout du produit "$nomProduit" à la commande $commandeId', name: 'CommandeService');

      final url = '$baseUrl/commandes/$commandeId/produits';
      developer.log('📤 Envoi requête POST vers: $url', name: 'CommandeService');

      final requestBody = {
        'nom_produit': nomProduit,
        'code_produit': codeProduit,
        'numero_serie': numeroSerie,
        'quantite': quantite,
        'personnel_id': personnelId,
        'statut': statut,
      };
      developer.log('📤 Body envoyé: ${json.encode(requestBody)}', name: 'CommandeService');

      final response = await http.post(
        Uri.parse(url),
        headers: _headers,
        body: json.encode(requestBody),
      );

      final data = _handleResponse(response, url: url);

      if (data['success'] == true && data['produit'] != null) {
        final produit = CommandeProduit.fromJson(data['produit']);
        developer.log('✅ Produit ajouté avec succès', name: 'CommandeService');
        return produit;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de l\'ajout du produit: $e', name: 'CommandeService', error: e);
      rethrow;
    }
  }

  // Mettre à jour un produit d'une commande
  static Future<CommandeProduit?> updateProduitCommande(
    String commandeId,
    String produitId, {
    String? numeroSerie,
    int? quantite,
    String? statut,
    String? nomProduit,
    String? codeProduit,
  }) async {
    try {
      developer.log('🔄 Mise à jour du produit $produitId', name: 'CommandeService');

      final updateData = <String, dynamic>{};
      if (numeroSerie != null) updateData['numero_serie'] = numeroSerie;
      if (quantite != null) updateData['quantite'] = quantite;
      if (statut != null) updateData['statut'] = statut;
      if (nomProduit != null) updateData['nom_produit'] = nomProduit;
      if (codeProduit != null) updateData['code_produit'] = codeProduit;

      final response = await http.put(
        Uri.parse('$baseUrl/commandes/$commandeId/produits/$produitId'),
        headers: _headers,
        body: json.encode(updateData),
      );

      final data = _handleResponse(response);

      if (data['success'] == true && data['produit'] != null) {
        final produit = CommandeProduit.fromJson(data['produit']);
        developer.log('✅ Produit mis à jour', name: 'CommandeService');
        return produit;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de la mise à jour du produit: $e', name: 'CommandeService', error: e);
      rethrow;
    }
  }

  // Supprimer un produit d'une commande
  static Future<bool> deleteProduitCommande(String commandeId, String produitId) async {
    try {
      developer.log('🔄 Suppression du produit $produitId', name: 'CommandeService');

      final response = await http.delete(
        Uri.parse('$baseUrl/commandes/$commandeId/produits/$produitId'),
        headers: _headers,
      );

      final data = _handleResponse(response);

      if (data['success'] == true) {
        developer.log('✅ Produit supprimé avec succès', name: 'CommandeService');
        return true;
      }

      return false;
    } catch (e) {
      developer.log('❌ Erreur lors de la suppression du produit: $e', name: 'CommandeService', error: e);
      rethrow;
    }
  }

  // Récupérer un produit spécifique d'une commande
  static Future<CommandeProduit?> getProduitCommande(String commandeId, String produitId) async {
    try {
      developer.log('🔄 Récupération du produit $produitId', name: 'CommandeService');

      final response = await http.get(
        Uri.parse('$baseUrl/commandes/$commandeId/produits/$produitId'),
        headers: _headers,
      );

      final data = _handleResponse(response);

      if (data['success'] == true && data['produit'] != null) {
        final produit = CommandeProduit.fromJson(data['produit']);
        developer.log('✅ Produit récupéré', name: 'CommandeService');
        return produit;
      }

      return null;
    } catch (e) {
      developer.log('❌ Erreur lors de la récupération du produit: $e', name: 'CommandeService', error: e);
      rethrow;
    }
  }
}