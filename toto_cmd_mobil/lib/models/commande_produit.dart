class CommandeProduit {
  final String id;
  final String commandeId;
  final int personnelId;
  final String nomProduit;
  final String? codeProduit;
  final String numeroSerie;
  final int quantite;
  final String statut;
  final String? dateScan;
  final String? remarque;
  final String? createdAt;
  final String? updatedAt;

  CommandeProduit({
    required this.id,
    required this.commandeId,
    required this.personnelId,
    required this.nomProduit,
    this.codeProduit,
    required this.numeroSerie,
    required this.quantite,
    required this.statut,
    this.dateScan,
    this.remarque,
    this.createdAt,
    this.updatedAt,
  });

  factory CommandeProduit.fromJson(Map<String, dynamic> json) {
    return CommandeProduit(
      id: json['id'],
      commandeId: json['commande_id'],
      personnelId: json['personnel_id'],
      nomProduit: json['nom_produit'],
      codeProduit: json['code_produit'],
      numeroSerie: json['numero_serie'] ?? '',
      quantite: json['quantite'] ?? 0,
      statut: json['statut'] ?? 'scanned',
      dateScan: json['date_scan'],
      remarque: json['remarque'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'commande_id': commandeId,
      'personnel_id': personnelId,
      'nom_produit': nomProduit,
      'code_produit': codeProduit,
      'numero_serie': numeroSerie,
      'quantite': quantite,
      'statut': statut,
      'date_scan': dateScan,
      'remarque': remarque,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }

  // Status constants
  static const String scanned = 'scanne';
  static const String prepared = 'prepare';
  static const String shipped = 'expedie';
  static const String notAvailable = 'non_disponible';
}