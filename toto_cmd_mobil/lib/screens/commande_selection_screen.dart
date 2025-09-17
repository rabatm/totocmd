import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/models.dart';
import '../providers/providers.dart';
import '../services/services.dart';
import 'produit_addition_screen.dart';

class CommandeSelectionScreen extends StatefulWidget {
  const CommandeSelectionScreen({super.key});

  @override
  State<CommandeSelectionScreen> createState() => _CommandeSelectionScreenState();
}

class _CommandeSelectionScreenState extends State<CommandeSelectionScreen> {
  List<Commande> _commandes = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    developer.log('📋 CommandeSelectionScreen initialisé', name: 'CommandeSelectionScreen');
    _loadCommandes();
  }

  Future<void> _loadCommandes() async {
    try {
      developer.log('🔄 Chargement des commandes...', name: 'CommandeSelectionScreen');
      setState(() {
        _isLoading = true;
      });

      final commandes = await SupabaseService.getCommandes();

      developer.log('✅ ${commandes.length} commandes chargées', name: 'CommandeSelectionScreen');
      // Log détaillé des commandes pour debug
      for (var i = 0; i < commandes.length && i < 3; i++) {
        var cmd = commandes[i];
        developer.log('📋 Commande ${i+1}: ${cmd.numeroCommande} - Client: ${cmd.client?.name ?? "NULL"} - Produits: ${cmd.commandeProduits?.length ?? 0}', name: 'CommandeSelectionScreen');
      }
      setState(() {
        _commandes = commandes;
        _isLoading = false;
      });
    } catch (e) {
      developer.log('❌ Erreur lors du chargement des commandes: $e', name: 'CommandeSelectionScreen', error: e);
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

  Future<void> _searchCommandes(String query) async {
    if (query.isEmpty) {
      developer.log('🔄 Recherche vide, chargement de toutes les commandes', name: 'CommandeSelectionScreen');
      await _loadCommandes();
      return;
    }

    developer.log('🔍 Recherche de commandes avec: "$query"', name: 'CommandeSelectionScreen');
    setState(() {
      _isLoading = true;
    });

    try {
      final commandes = await SupabaseService.searchCommandes(query);
      developer.log('✅ ${commandes.length} commandes trouvées pour "$query"', name: 'CommandeSelectionScreen');
      setState(() {
        _commandes = commandes;
        _isLoading = false;
      });
    } catch (e) {
      developer.log('❌ Erreur lors de la recherche: $e', name: 'CommandeSelectionScreen', error: e);
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur de recherche: $e')),
        );
      }
    }
  }

  List<Commande> get _filteredCommandes {
    if (_searchQuery.isEmpty) return _commandes;
    return _commandes.where((commande) =>
      commande.numeroCommande.toLowerCase().contains(_searchQuery.toLowerCase())
    ).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sélectionner une Commande'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: const InputDecoration(
                labelText: 'Rechercher par numéro',
                prefixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
                _searchCommandes(value);
              },
            ),
          ),
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _filteredCommandes.isEmpty
                ? const Center(
                    child: Text('Aucune commande trouvée'),
                  )
                : ListView.builder(
                    itemCount: _filteredCommandes.length,
                    itemBuilder: (context, index) {
                      final commande = _filteredCommandes[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 4,
                        ),
                        child: ListTile(
                          title: Text('Commande ${commande.numeroCommande}'),
                          subtitle: Text(
                            '${commande.client?.name ?? 'Client inconnu'} - ${commande.commandeProduits?.length ?? 0} produits'
                          ),
                          trailing: const Icon(Icons.arrow_forward),
                          onTap: () {
                            context.read<AppState>().selectCommande(commande);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ProduitAdditionScreen(),
                              ),
                            );
                          },
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