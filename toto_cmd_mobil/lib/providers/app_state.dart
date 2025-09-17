import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/services.dart';

class AppState extends ChangeNotifier {
  Commande? _selectedCommande;
  ExtrabatCommande? _selectedExtrabatCommande;
  Produit? _selectedProduit;
  String? _scannedData;
  bool _isScanning = false;
  bool _apiConnected = false;

  Commande? get selectedCommande => _selectedCommande;
  ExtrabatCommande? get selectedExtrabatCommande => _selectedExtrabatCommande;
  Produit? get selectedProduit => _selectedProduit;
  String? get scannedData => _scannedData;
  bool get isScanning => _isScanning;
  bool get apiConnected => _apiConnected;

  void selectCommande(Commande commande) {
    _selectedCommande = commande;
    _selectedExtrabatCommande = null; // Clear ExtraBat selection
    notifyListeners();
  }

  void selectExtrabatCommande(ExtrabatCommande commande) {
    _selectedExtrabatCommande = commande;
    _selectedCommande = null; // Clear local selection
    notifyListeners();
  }

  void selectProduit(Produit produit) {
    _selectedProduit = produit;
    notifyListeners();
  }

  void setApiConnected(bool connected) {
    _apiConnected = connected;
    notifyListeners();
  }

  void setScannedData(String data) {
    _scannedData = data;
    notifyListeners();
  }

  void setScanning(bool scanning) {
    _isScanning = scanning;
    notifyListeners();
  }

  void clearSelection() {
    _selectedCommande = null;
    _selectedExtrabatCommande = null;
    _selectedProduit = null;
    _scannedData = null;
    notifyListeners();
  }

  // Initialisation de l'app avec test de connexion
  Future<void> initialize() async {
    try {
      // Tester la connexion à l'API
      final apiConnected = await HybridService.testApiConnection();
      setApiConnected(apiConnected);

      // Initialiser Supabase
      await HybridService.initializeSupabase();
    } catch (e) {
      setApiConnected(false);
    }
  }

  // Import d'une commande ExtraBat
  Future<Map<String, dynamic>> importExtrabatCommande(String pieceId) async {
    return await HybridService.processCommandeExtraBat(pieceId);
  }

  // Synchronisation complète
  Future<Map<String, dynamic>> performFullSync() async {
    return await HybridService.fullSync();
  }

  Future<void> addProduitToCommande(String numeroSerie) async {
    if (_selectedCommande == null || _selectedProduit == null) return;

    try {
      await HybridService.addProduitToCommande(
        commandeId: _selectedCommande!.id,
        produitId: _selectedProduit!.id,
        nomProduit: _selectedProduit!.libelle,
        numeroSerie: numeroSerie,
        codeProduit: _selectedProduit!.code,
      );

      // Recharger la commande pour mettre à jour la liste des produits
      final updatedCommande = await HybridService.getCommandeById(_selectedCommande!.id);
      if (updatedCommande != null) {
        _selectedCommande = updatedCommande;
        notifyListeners();
      }
    } catch (e) {
      throw Exception('Erreur lors de l\'ajout du produit: $e');
    }
  }
}