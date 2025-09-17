import 'package:flutter/material.dart';
import 'dart:developer' as developer;
import 'dart:async';
import '../models/models.dart';
import '../services/commande_service.dart';

class ProduitSearchDialog extends StatefulWidget {
  const ProduitSearchDialog({super.key});

  @override
  State<ProduitSearchDialog> createState() => _ProduitSearchDialogState();
}

class _ProduitSearchDialogState extends State<ProduitSearchDialog> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _numeroSerieController = TextEditingController();
  List<Produit> _produits = [];
  Produit? _selectedProduit;
  bool _isLoading = false;
  bool _hasSearched = false;
  Timer? _searchTimer;

  @override
  void initState() {
    super.initState();
    _loadInitialProduits();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _numeroSerieController.dispose();
    _searchTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadInitialProduits() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final produits = await CommandeService.getProduits(limit: 20);
      setState(() {
        _produits = produits;
        _isLoading = false;
        _hasSearched = true;
      });
    } catch (e) {
      developer.log('❌ Erreur chargement produits: $e', name: 'ProduitSearchDialog');
      setState(() {
        _isLoading = false;
        _hasSearched = true;
      });
    }
  }

  Future<void> _searchProduits(String query) async {
    if (query.isEmpty) {
      await _loadInitialProduits();
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final produits = await CommandeService.getProduits(
        search: query,
        limit: 50,
      );
      setState(() {
        _produits = produits;
        _isLoading = false;
        _hasSearched = true;
      });
    } catch (e) {
      developer.log('❌ Erreur recherche produits: $e', name: 'ProduitSearchDialog');
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _selectProduit(Produit produit) {
    setState(() {
      _selectedProduit = produit;
      _searchController.text = produit.libelle;
    });
  }

  void _addProduit() {
    if (_selectedProduit == null || _numeroSerieController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez sélectionner un produit et saisir un numéro de série'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    Navigator.of(context).pop({
      'nomProduit': _selectedProduit!.libelle,
      'codeProduit': _selectedProduit!.code,
      'numeroSerie': _numeroSerieController.text.trim(),
      'quantite': 1,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: MediaQuery.of(context).size.width * 0.9,
        height: MediaQuery.of(context).size.height * 0.8,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // En-tête
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Ajouter un produit',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Recherche de produit
            TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Rechercher un produit',
                hintText: 'Tapez le nom ou code du produit...',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                // Annuler le timer précédent
                _searchTimer?.cancel();

                // Créer un nouveau timer
                _searchTimer = Timer(const Duration(milliseconds: 500), () {
                  if (value.isEmpty) {
                    _loadInitialProduits();
                  } else {
                    _searchProduits(value);
                  }
                });
              },
            ),
            const SizedBox(height: 16),

            // Liste des produits
            Expanded(
              flex: 2,
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : !_hasSearched
                        ? const Center(
                            child: Text('Tapez pour rechercher des produits'),
                          )
                        : _produits.isEmpty
                            ? const Center(
                                child: Text('Aucun produit trouvé'),
                              )
                            : ListView.builder(
                                itemCount: _produits.length,
                                itemBuilder: (context, index) {
                                  final produit = _produits[index];
                                  final isSelected = _selectedProduit?.id == produit.id;
                                  
                                  return ListTile(
                                    selected: isSelected,
                                    selectedTileColor: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                                    title: Text(
                                      produit.libelle,
                                      style: TextStyle(
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                      ),
                                    ),
                                    subtitle: Text('Code: ${produit.code}'),
                                    trailing: Text(
                                      '${produit.prix.toStringAsFixed(2)} €',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green,
                                      ),
                                    ),
                                    onTap: () => _selectProduit(produit),
                                  );
                                },
                              ),
              ),
            ),
            const SizedBox(height: 16),

            // Numéro de série
            TextField(
              controller: _numeroSerieController,
              decoration: const InputDecoration(
                labelText: 'Numéro de série *',
                hintText: 'Saisissez ou scannez le numéro de série',
                prefixIcon: Icon(Icons.qr_code_scanner),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),

            // Produit sélectionné
            if (_selectedProduit != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  border: Border.all(color: Colors.green.shade200),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Produit sélectionné:',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.green.shade700,
                            ),
                          ),
                          Text(
                            _selectedProduit!.libelle,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Boutons
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Annuler'),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addProduit,
                  child: const Text('Ajouter'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}