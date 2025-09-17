class Produit {
  final int id;
  final String code;
  final String? codeBarre;
  final String libelle;
  final String? description;
  final double prix;
  final double? prixMini;
  final double? prixConseille;
  final bool tenueStock;
  final double? poids;
  final String? emplacement;
  final String? notes;
  final bool commissionable;
  final double tauxTva;
  final String? uniteLibelle;
  final int? sousFamilleId;
  final String? sousFamilleLibelle;
  final int? familleId;
  final String? familleLibelle;
  final int? articleTypeId;
  final String? articleTypeLibelle;
  final bool hasImage;
  final bool hasImageGd;
  final String lastSync;
  final bool? archived;
  final String? createdAt;
  final String? updatedAt;

  Produit({
    required this.id,
    required this.code,
    this.codeBarre,
    required this.libelle,
    this.description,
    required this.prix,
    this.prixMini,
    this.prixConseille,
    required this.tenueStock,
    this.poids,
    this.emplacement,
    this.notes,
    required this.commissionable,
    required this.tauxTva,
    this.uniteLibelle,
    this.sousFamilleId,
    this.sousFamilleLibelle,
    this.familleId,
    this.familleLibelle,
    this.articleTypeId,
    this.articleTypeLibelle,
    required this.hasImage,
    required this.hasImageGd,
    required this.lastSync,
    this.archived,
    this.createdAt,
    this.updatedAt,
  });

  factory Produit.fromJson(Map<String, dynamic> json) {
    return Produit(
      id: json['id'],
      code: json['code'] ?? '',
      codeBarre: json['code_barre'],
      libelle: json['libelle'] ?? json['nom'] ?? '', // API utilise 'libelle'
      description: json['description'],
      prix: json['prix'] != null ? (json['prix'] as num).toDouble() : 0.0, // API utilise 'prix'
      prixMini: json['prix_mini'] != null ? (json['prix_mini'] as num).toDouble() : null,
      prixConseille: json['prix_conseille'] != null ? (json['prix_conseille'] as num).toDouble() : null,
      tenueStock: json['tenue_stock'] ?? false,
      poids: json['poids'] != null ? (json['poids'] as num).toDouble() : null,
      emplacement: json['emplacement'],
      notes: json['notes'],
      commissionable: json['commissionable'] ?? false,
      tauxTva: json['taux_tva'] != null ? (json['taux_tva'] as num).toDouble() : 0.0,
      uniteLibelle: json['unite_libelle'],
      sousFamilleId: json['sous_famille_id'],
      sousFamilleLibelle: json['sous_famille_libelle'],
      familleId: json['famille_id'],
      familleLibelle: json['famille_libelle'],
      articleTypeId: json['article_type_id'],
      articleTypeLibelle: json['article_type_libelle'],
      hasImage: json['has_image'] ?? false,
      hasImageGd: json['has_image_gd'] ?? false,
      lastSync: json['last_sync'] ?? '',
      archived: json['archived'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'code_barre': codeBarre,
      'libelle': libelle,
      'description': description,
      'prix': prix,
      'prix_mini': prixMini,
      'prix_conseille': prixConseille,
      'tenue_stock': tenueStock,
      'poids': poids,
      'emplacement': emplacement,
      'notes': notes,
      'commissionable': commissionable,
      'taux_tva': tauxTva,
      'unite_libelle': uniteLibelle,
      'sous_famille_id': sousFamilleId,
      'sous_famille_libelle': sousFamilleLibelle,
      'famille_id': familleId,
      'famille_libelle': familleLibelle,
      'article_type_id': articleTypeId,
      'article_type_libelle': articleTypeLibelle,
      'has_image': hasImage,
      'has_image_gd': hasImageGd,
      'last_sync': lastSync,
      'archived': archived,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}