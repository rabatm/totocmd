import 'dart:developer' as developer;
import 'commande_produit.dart';

class Commande {
  final String id;
  final int clientId;
  final String numeroCommande;
  final String? dateCommande;
  final String? dateLimiteExpedition;
  final double? acompteVerse;
  final String etat;
  final double? progression;
  final String? expeditionId;
  final String? remarque;
  final double? totalTtc;
  final double? totalHt;
  final double? totalTva;
  final String? extrabatId;
  final String? modeReglement;
  final String? createdAt;
  final String? updatedAt;

  // Relations
  final Client? client;
  final List<CommandeProduit>? commandeProduits;

  Commande({
    required this.id,
    required this.clientId,
    required this.numeroCommande,
    this.dateCommande,
    this.dateLimiteExpedition,
    this.acompteVerse,
    required this.etat,
    this.progression,
    this.expeditionId,
    this.remarque,
    this.totalTtc,
    this.totalHt,
    this.totalTva,
    this.extrabatId,
    this.modeReglement,
    this.createdAt,
    this.updatedAt,
    this.client,
    this.commandeProduits,
  });

  factory Commande.fromJson(Map<String, dynamic> json) {
    // Debug: Log les types de chaque champ pour identifier le problème
    developer.log('🔍 Debug Commande.fromJson - ID: ${json['id']}', name: 'CommandeModel');
    developer.log('client_id: ${json['client_id']} (${json['client_id'].runtimeType})', name: 'CommandeModel');
    developer.log('numero_commande: ${json['numero_commande']} (${json['numero_commande'].runtimeType})', name: 'CommandeModel');
    developer.log('date_commande: ${json['date_commande']} (${json['date_commande'].runtimeType})', name: 'CommandeModel');
    developer.log('etat: ${json['etat']} (${json['etat'].runtimeType})', name: 'CommandeModel');
    developer.log('remarque: ${json['remarque']} (${json['remarque'].runtimeType})', name: 'CommandeModel');
    developer.log('total_ttc: ${json['total_ttc']} (${json['total_ttc'].runtimeType})', name: 'CommandeModel');
    developer.log('total_ht: ${json['total_ht']} (${json['total_ht'].runtimeType})', name: 'CommandeModel');
    developer.log('total_tva: ${json['total_tva']} (${json['total_tva'].runtimeType})', name: 'CommandeModel');
    developer.log('progression: ${json['progression']} (${json['progression'].runtimeType})', name: 'CommandeModel');
    developer.log('acompte_verse: ${json['acompte_verse']} (${json['acompte_verse'].runtimeType})', name: 'CommandeModel');

    return Commande(
      id: json['id'].toString(),  // ✅ Conversion sécurisée
      clientId: json['client_id'] as int,
      numeroCommande: json['numero_commande'].toString(),  // ✅ Conversion sécurisée
      dateCommande: json['date_commande']?.toString(),  // ✅ Conversion sécurisée
      dateLimiteExpedition: json['date_limite_expedition']?.toString(),  // ✅ Conversion sécurisée
      acompteVerse: json['acompte_verse'] != null ? (json['acompte_verse'] as num).toDouble() : 0.0,
      etat: json['etat'].toString(),  // ✅ Conversion sécurisée
      progression: json['progression'] != null ? (json['progression'] as num).toDouble() : 0.0,
      expeditionId: json['expedition_id']?.toString(),  // ✅ Conversion sécurisée
      remarque: json['remarque']?.toString(),  // ✅ Conversion sécurisée
      totalTtc: json['total_ttc'] != null ? (json['total_ttc'] as num).toDouble() : 0.0,
      totalHt: json['total_ht'] != null ? (json['total_ht'] as num).toDouble() : null,
      totalTva: json['total_tva'] != null ? (json['total_tva'] as num).toDouble() : null,
      extrabatId: json['extrabat_id']?.toString(),  // ✅ Conversion sécurisée
      modeReglement: json['mode_reglement']?.toString(),  // ✅ Conversion sécurisée
      createdAt: json['created_at']?.toString(),  // ✅ Conversion sécurisée
      updatedAt: json['updated_at']?.toString(),  // ✅ Conversion sécurisée
      client: json['clients'] != null ? Client.fromJson(json['clients'] as Map<String, dynamic>) : null,
      commandeProduits: json['commande_produits'] != null
          ? (json['commande_produits'] as List)
              .map((item) => CommandeProduit.fromJson(item))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'client_id': clientId,
      'numero_commande': numeroCommande,
      'date_commande': dateCommande,
      'date_limite_expedition': dateLimiteExpedition,
      'acompte_verse': acompteVerse,
      'etat': etat,
      'progression': progression,
      'expedition_id': expeditionId,
      'remarque': remarque,
      'total_ttc': totalTtc,
      'total_ht': totalHt,
      'total_tva': totalTva,
      'extrabat_id': extrabatId,
      'mode_reglement': modeReglement,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  // Status constants
  static const String enAttente = 'en_attente';
  static const String enPreparation = 'en_preparation';
  static const String prete = 'prete';
  static const String expedie = 'expedie';
  static const String annulee = 'annulee';
}

class Client {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? address;
  final String? city;
  final String? postalCode;
  final String? country;
  final String? extrabatId;
  final String? createdAt;
  final String? updatedAt;

  Client({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.address,
    this.city,
    this.postalCode,
    this.country,
    this.extrabatId,
    this.createdAt,
    this.updatedAt,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'].toString(),  // ✅ Conversion sécurisée
      name: (json['nom'] ?? json['name']).toString(),  // ✅ Support des deux formats API
      email: json['email']?.toString(),  // ✅ Conversion sécurisée
      phone: (json['telephone'] ?? json['phone'])?.toString(),  // ✅ Support des deux formats
      address: (json['adresse'] ?? json['address'])?.toString(),  // ✅ Support des deux formats
      city: json['city']?.toString(),  // ✅ Conversion sécurisée
      postalCode: json['postal_code']?.toString(),  // ✅ Conversion sécurisée
      country: json['country']?.toString(),  // ✅ Conversion sécurisée
      extrabatId: json['extrabat_id']?.toString(),  // ✅ Conversion sécurisée
      createdAt: json['created_at']?.toString(),  // ✅ Conversion sécurisée
      updatedAt: json['updated_at']?.toString(),  // ✅ Conversion sécurisée
    );
  }
}