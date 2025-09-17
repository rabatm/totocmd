import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/commande_service.dart';
import '../widgets/produit_search_dialog.dart';
import '../widgets/produit_edit_dialog.dart';

class CommandeDetailScreen extends StatefulWidget {
  final String commandeId;

  const CommandeDetailScreen({
    super.key,
    required this.commandeId,
  });

  @override
  State<CommandeDetailScreen> createState() => _CommandeDetailScreenState();
}

class _CommandeDetailScreenState extends State<CommandeDetailScreen> {
  Commande? _commande;
  List<CommandeProduit> _produits = [];
  bool _isLoading = true;
  bool _isLoadingProduits = false;

  @override
  void initState() {
    super.initState();
    _loadCommandeDetail();
  }

  Future<void> _loadCommandeDetail() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Charger la commande et ses produits en parallèle
      final futures = await Future.wait([
        CommandeService.getCommandeById(widget.commandeId),
        CommandeService.getCommandeProduits(widget.commandeId),
      ]);

      final commande = futures[0] as Commande?;
      final produits = futures[1] as List<CommandeProduit>;

      setState(() {
        _commande = commande;
        _produits = produits;
        _isLoading = false;
      });

      developer.log('✅ Détails de la commande chargés', name: 'CommandeDetailScreen');
    } catch (e) {
      developer.log('❌ Erreur lors du chargement: $e', name: 'CommandeDetailScreen', error: e);

      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du chargement: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _reloadProduits() async {
    setState(() {
      _isLoadingProduits = true;
    });

    try {
      final produits = await CommandeService.getCommandeProduits(widget.commandeId);
      setState(() {
        _produits = produits;
        _isLoadingProduits = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingProduits = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du rechargement: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _showAddProduitDialog() async {
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => const ProduitSearchDialog(),
    );

    if (result != null) {
      await _addProduit(result);
    }
  }

  Future<void> _addProduit(Map<String, dynamic> produitData) async {
    try {
      await CommandeService.addProduitToCommande(
        widget.commandeId,
        nomProduit: produitData['nomProduit'],
        numeroSerie: produitData['numeroSerie'],
        codeProduit: produitData['codeProduit'],
        quantite: produitData['quantite'] ?? 1,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Produit ajouté avec succès'),
            backgroundColor: Colors.green,
          ),
        );
      }

      await _reloadProduits();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de l\'ajout: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _showEditProduitDialog(CommandeProduit produit) async {
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => ProduitEditDialog(produit: produit),
    );

    if (result != null) {
      await _updateProduit(produit.id, result);
    }
  }

  Future<void> _updateProduit(String produitId, Map<String, dynamic> produitData) async {
    try {
      await CommandeService.updateProduitCommande(
        widget.commandeId,
        produitId,
        nomProduit: produitData['nomProduit'],
        numeroSerie: produitData['numeroSerie'],
        codeProduit: produitData['codeProduit'],
        quantite: produitData['quantite'],
        statut: produitData['statut'],
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Produit modifié avec succès'),
            backgroundColor: Colors.green,
          ),
        );
      }

      await _reloadProduits();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la modification: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _deleteProduit(CommandeProduit produit) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmer la suppression'),
        content: Text('Êtes-vous sûr de vouloir supprimer "${produit.nomProduit}" ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await CommandeService.deleteProduitCommande(widget.commandeId, produit.id);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Produit supprimé avec succès'),
              backgroundColor: Colors.green,
            ),
          );
        }

        await _reloadProduits();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erreur lors de la suppression: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  String _getStatutLabel(String statut) {
    switch (statut) {
      case 'scanne':
        return 'Scanné';
      case 'en_preparation':
        return 'En préparation';
      case 'pret_expedition':
        return 'Prêt expédition';
      case 'expedie':
        return 'Expédié';
      case 'livre':
        return 'Livré';
      default:
        return statut;
    }
  }

  Color _getStatutColor(String statut) {
    switch (statut) {
      case 'scanne':
        return Colors.blue;
      case 'en_preparation':
        return Colors.orange;
      case 'pret_expedition':
        return Colors.purple;
      case 'expedie':
        return Colors.green;
      case 'livre':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_commande?.numeroCommande ?? 'Commande'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            onPressed: _loadCommandeDetail,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _commande == null
              ? const Center(
                  child: Text(
                    'Commande non trouvée',
                    style: TextStyle(fontSize: 18, color: Colors.red),
                  ),
                )
              : Column(
                  children: [
                    // En-tête de la commande
                    Card(
                      margin: const EdgeInsets.all(16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  _commande!.numeroCommande,
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  '${(_commande!.totalTtc ?? 0).toStringAsFixed(2)} €',  
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            if (_commande!.client != null) ...[
                              Text(
                                _commande!.client!.name,
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                              const SizedBox(height: 8),
                            ],
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _getStatutColor(_commande!.etat),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    _getStatutLabel(_commande!.etat),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Text(
                                  'Progression: ${(_commande!.progression ?? 0).toStringAsFixed(0)}%',
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                            if (_commande!.remarque != null &&
                                _commande!.remarque!.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text(
                                'Remarque: ${_commande!.remarque}',
                                style: TextStyle(
                                  color: Colors.grey[700],
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),

                    // Liste des produits
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Produits (${_produits.length})',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: _showAddProduitDialog,
                            icon: const Icon(Icons.add, size: 18),
                            label: const Text('Ajouter'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 8),

                    Expanded(
                      child: _isLoadingProduits
                          ? const Center(child: CircularProgressIndicator())
                          : _produits.isEmpty
                              ? const Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.inventory_2_outlined,
                                        size: 64,
                                        color: Colors.grey,
                                      ),
                                      SizedBox(height: 16),
                                      Text(
                                        'Aucun produit dans cette commande',
                                        style: TextStyle(
                                          fontSize: 16,
                                          color: Colors.grey,
                                        ),
                                      ),
                                      SizedBox(height: 8),
                                      Text(
                                        'Appuyez sur "Ajouter" pour commencer',
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              : ListView.builder(
                                  itemCount: _produits.length,
                                  itemBuilder: (context, index) {
                                    final produit = _produits[index];
                                    return Card(
                                      margin: const EdgeInsets.symmetric(
                                        horizontal: 16,
                                        vertical: 4,
                                      ),
                                      child: ListTile(
                                        leading: CircleAvatar(
                                          backgroundColor: _getStatutColor(produit.statut),
                                          child: Text(
                                            produit.quantite.toString(),
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        title: Text(
                                          produit.nomProduit,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        subtitle: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            if (produit.codeProduit != null)
                                              Text('Code: ${produit.codeProduit}'),
                                            Text('SN: ${produit.numeroSerie}'),
                                            Container(
                                              margin: const EdgeInsets.only(top: 4),
                                              padding: const EdgeInsets.symmetric(
                                                horizontal: 8,
                                                vertical: 2,
                                              ),
                                              decoration: BoxDecoration(
                                                color: _getStatutColor(produit.statut),
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                              child: Text(
                                                _getStatutLabel(produit.statut),
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 12,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        trailing: PopupMenuButton<String>(
                                          onSelected: (value) {
                                            switch (value) {
                                              case 'edit':
                                                _showEditProduitDialog(produit);
                                                break;
                                              case 'delete':
                                                _deleteProduit(produit);
                                                break;
                                            }
                                          },
                                          itemBuilder: (context) => [
                                            const PopupMenuItem(
                                              value: 'edit',
                                              child: Row(
                                                children: [
                                                  Icon(Icons.edit, size: 18),
                                                  SizedBox(width: 8),
                                                  Text('Modifier'),
                                                ],
                                              ),
                                            ),
                                            const PopupMenuItem(
                                              value: 'delete',
                                              child: Row(
                                                children: [
                                                  Icon(
                                                    Icons.delete,
                                                    size: 18,
                                                    color: Colors.red,
                                                  ),
                                                  SizedBox(width: 8),
                                                  Text(
                                                    'Supprimer',
                                                    style: TextStyle(color: Colors.red),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                    ),
                  ],
                ),
    );
  }
}