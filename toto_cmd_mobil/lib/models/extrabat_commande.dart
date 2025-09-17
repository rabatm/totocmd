class ExtrabatCommande {
  final String pieceId;
  final String numero;
  final String type;
  final String? dateCreation;
  final String? dateLimiteLivraison;
  final double totalTTC;
  final double? totalHT;
  final String? statut;
  final String? remarques;
  final ExtrabatClient? client;
  final List<ExtrabatLigne>? lignes;

  ExtrabatCommande({
    required this.pieceId,
    required this.numero,
    required this.type,
    this.dateCreation,
    this.dateLimiteLivraison,
    required this.totalTTC,
    this.totalHT,
    this.statut,
    this.remarques,
    this.client,
    this.lignes,
  });

  factory ExtrabatCommande.fromJson(Map<String, dynamic> json) {
    return ExtrabatCommande(
      pieceId: json['PieceId']?.toString() ?? '',
      numero: json['Numero']?.toString() ?? '',
      type: json['Type']?.toString() ?? '',
      dateCreation: json['DateCreation']?.toString(),
      dateLimiteLivraison: json['DateLimiteLivraison']?.toString(),
      totalTTC: (json['TotalTTC'] as num?)?.toDouble() ?? 0.0,
      totalHT: (json['TotalHT'] as num?)?.toDouble(),
      statut: json['Statut']?.toString(),
      remarques: json['Remarques']?.toString(),
      client: json['Client'] != null ? ExtrabatClient.fromJson(json['Client']) : null,
      lignes: json['Lignes'] != null
          ? (json['Lignes'] as List).map((e) => ExtrabatLigne.fromJson(e)).toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'PieceId': pieceId,
      'Numero': numero,
      'Type': type,
      'DateCreation': dateCreation,
      'DateLimiteLivraison': dateLimiteLivraison,
      'TotalTTC': totalTTC,
      'TotalHT': totalHT,
      'Statut': statut,
      'Remarques': remarques,
      'Client': client?.toJson(),
      'Lignes': lignes?.map((e) => e.toJson()).toList(),
    };
  }
}

class ExtrabatClient {
  final String? clientId;
  final String? nom;
  final String? prenom;
  final String? email;
  final String? telephone;
  final String? adresse;
  final String? ville;
  final String? codePostal;

  ExtrabatClient({
    this.clientId,
    this.nom,
    this.prenom,
    this.email,
    this.telephone,
    this.adresse,
    this.ville,
    this.codePostal,
  });

  factory ExtrabatClient.fromJson(Map<String, dynamic> json) {
    return ExtrabatClient(
      clientId: json['ClientId']?.toString(),
      nom: json['Nom']?.toString(),
      prenom: json['Prenom']?.toString(),
      email: json['Email']?.toString(),
      telephone: json['Telephone']?.toString(),
      adresse: json['Adresse']?.toString(),
      ville: json['Ville']?.toString(),
      codePostal: json['CodePostal']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ClientId': clientId,
      'Nom': nom,
      'Prenom': prenom,
      'Email': email,
      'Telephone': telephone,
      'Adresse': adresse,
      'Ville': ville,
      'CodePostal': codePostal,
    };
  }

  String get nomComplet => '${nom ?? ''} ${prenom ?? ''}'.trim();
}

class ExtrabatLigne {
  final String? ligneId;
  final String? articleId;
  final String? designation;
  final double quantite;
  final double? prixUnitaire;
  final double? totalLigne;
  final String? unite;
  final String? remarques;

  ExtrabatLigne({
    this.ligneId,
    this.articleId,
    this.designation,
    required this.quantite,
    this.prixUnitaire,
    this.totalLigne,
    this.unite,
    this.remarques,
  });

  factory ExtrabatLigne.fromJson(Map<String, dynamic> json) {
    return ExtrabatLigne(
      ligneId: json['LigneId']?.toString(),
      articleId: json['ArticleId']?.toString(),
      designation: json['Designation']?.toString(),
      quantite: (json['Quantite'] as num?)?.toDouble() ?? 0.0,
      prixUnitaire: (json['PrixUnitaire'] as num?)?.toDouble(),
      totalLigne: (json['TotalLigne'] as num?)?.toDouble(),
      unite: json['Unite']?.toString(),
      remarques: json['Remarques']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'LigneId': ligneId,
      'ArticleId': articleId,
      'Designation': designation,
      'Quantite': quantite,
      'PrixUnitaire': prixUnitaire,
      'TotalLigne': totalLigne,
      'Unite': unite,
      'Remarques': remarques,
    };
  }
}