import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../services/services.dart';

class ProduitAdditionScreen extends StatefulWidget {
  const ProduitAdditionScreen({super.key});

  @override
  State<ProduitAdditionScreen> createState() => _ProduitAdditionScreenState();
}

class _ProduitAdditionScreenState extends State<ProduitAdditionScreen> {
  List<Produit> _produits = [];
  bool _isLoading = true;
  String _searchQuery = '';
  bool _isAddingProduit = false;

  @override
  void initState() {
    super.initState();
    developer.log('📦 ProduitAdditionScreen initialisé', name: 'ProduitAdditionScreen');
    _loadProduits();
    _setupScanner();
  }

  Future<void> _loadProduits() async {
    try {
      developer.log('🔄 Chargement des produits...', name: 'ProduitAdditionScreen');
      setState(() {
        _isLoading = true;
      });

      final produits = await SupabaseService.getProduits();

      developer.log('✅ ${produits.length} produits chargés', name: 'ProduitAdditionScreen');
      // Log détaillé des produits pour debug
      for (var i = 0; i < produits.length && i < 5; i++) {
        var prod = produits[i];
        developer.log('📦 Produit ${i+1}: ${prod.libelle} (Code: ${prod.code}) - Prix: ${prod.prix}€', name: 'ProduitAdditionScreen');
      }
      setState(() {
        _produits = produits;
        _isLoading = false;
      });
    } catch (e) {
      developer.log('❌ Erreur lors du chargement des produits: $e', name: 'ProduitAdditionScreen', error: e);
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de chargement: $e')),
        );
      }
    }
  }

  void _setupScanner() {
    developer.log('🔧 Configuration du scanner...', name: 'ProduitAdditionScreen');
    final scannerService = ZebraScannerService();
    scannerService.setScanCallback((data) {
      developer.log('📱 Données scannées reçues dans ProduitAdditionScreen: $data', name: 'ProduitAdditionScreen');
      if (mounted) {
        context.read<AppState>().setScannedData(data);
        _handleScannedData(data);
      }
    });
  }

  Future<void> _handleScannedData(String data) async {
    developer.log('🔄 Traitement des données scannées: $data', name: 'ProduitAdditionScreen');
    final appState = context.read<AppState>();
    final selectedProduit = appState.selectedProduit;
    final selectedCommande = appState.selectedCommande;

    if (selectedProduit == null || selectedCommande == null) {
      developer.log('⚠️ Aucun produit ou commande sélectionné', name: 'ProduitAdditionScreen');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez d\'abord sélectionner un produit')),
      );
      return;
    }

    developer.log('📝 Ajout du produit "${selectedProduit.libelle}" avec SN: $data', name: 'ProduitAdditionScreen');
    setState(() {
      _isAddingProduit = true;
    });

    // Store context to avoid using it across async gap
    final scaffoldMessenger = ScaffoldMessenger.of(context);

    try {
      await appState.addProduitToCommande(data);
      developer.log('✅ Produit ajouté avec succès', name: 'ProduitAdditionScreen');
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Produit ${selectedProduit.libelle} ajouté avec SN: $data')),
      );
      appState.setScannedData(''); // Clear scanned data
    } catch (e) {
      developer.log('❌ Erreur lors de l\'ajout du produit: $e', name: 'ProduitAdditionScreen', error: e);
      scaffoldMessenger.showSnackBar(
        SnackBar(content: Text('Erreur: $e')),
      );
    } finally {
      setState(() {
        _isAddingProduit = false;
      });
    }
  }

  List<Produit> get _filteredProduits {
    if (_searchQuery.isEmpty) return _produits;
    return _produits.where((produit) =>
      produit.libelle.toLowerCase().contains(_searchQuery.toLowerCase()) ||
      produit.code.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();
    final selectedCommande = appState.selectedCommande;
    final selectedProduit = appState.selectedProduit;
    final scannedData = appState.scannedData;

    return Scaffold(
      appBar: AppBar(
        title: Text('Commande ${selectedCommande?.numeroCommande ?? ''}'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          // Informations de la commande sélectionnée
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue.shade50,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Commande: ${selectedCommande?.numeroCommande ?? ''}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                Text('Client: ${selectedCommande?.client?.name ?? ''}'),
                Text('Produits: ${selectedCommande?.commandeProduits?.length ?? 0}'),
              ],
            ),
          ),

          // Produit sélectionné et données scannées
          if (selectedProduit != null || scannedData != null)
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.green.shade50,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (selectedProduit != null)
                    Text(
                      'Produit sélectionné: ${selectedProduit.libelle}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  if (scannedData != null)
                    Text(
                      'Données scannées: $scannedData',
                      style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                    ),
                  if (_isAddingProduit)
                    const CircularProgressIndicator(),
                ],
              ),
            ),

          // Recherche de produits
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Rechercher un produit',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
          ),

          // Liste des produits
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _filteredProduits.isEmpty
                ? const Center(
                    child: Text('Aucun produit trouvé'),
                  )
                : ListView.builder(
                    itemCount: _filteredProduits.length,
                    itemBuilder: (context, index) {
                      final produit = _filteredProduits[index];
                      final isSelected = selectedProduit?.id == produit.id;

                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 4,
                        ),
                        color: isSelected ? Colors.blue.shade50 : null,
                        child: ListTile(
                          title: Text(produit.libelle),
                          subtitle: Text('Code: ${produit.code}'),
                          trailing: isSelected
                            ? const Icon(Icons.check, color: Colors.green)
                            : const Icon(Icons.arrow_forward),
                          onTap: () {
                            appState.selectProduit(produit);
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Toggle scanner
          final scannerService = ZebraScannerService();
          if (appState.isScanning) {
            scannerService.disableScanner();
            appState.setScanning(false);
          } else {
            scannerService.enableScanner();
            appState.setScanning(true);
          }
        },
        child: Icon(
          appState.isScanning ? Icons.qr_code_scanner : Icons.qr_code,
        ),
      ),
    );
  }
}