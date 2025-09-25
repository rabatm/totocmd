import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/commande_service.dart';
import 'commande_detail_screen.dart';

class CommandesListScreen extends StatefulWidget {
  const CommandesListScreen({super.key});

  @override
  State<CommandesListScreen> createState() => _CommandesListScreenState();
}

class _CommandesListScreenState extends State<CommandesListScreen> {
  List<Commande> _commandes = [];
  bool _isLoading = true;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadCommandes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadCommandes() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final commandes = await CommandeService.getCommandes(
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
        limit: 50,
      );

      setState(() {
        _commandes = commandes;
        _isLoading = false;
      });

      developer.log('✅ ${commandes.length} commandes chargées', name: 'CommandesListScreen');
    } catch (e) {
      developer.log('❌ Erreur lors du chargement des commandes: $e', name: 'CommandesListScreen', error: e);

      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors du chargement des commandes: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _searchCommandes(String query) async {
    setState(() {
      _searchQuery = query;
    });
    await _loadCommandes();
  }

  String _getEtatLabel(String etat) {
    switch (etat) {
      case 'en_attente':
        return 'En attente';
      case 'en_cours':
        return 'En cours';
      case 'pret_expedition':
        return 'Prêt expédition';
      case 'expedie':
        return 'Expédiée';
      case 'annule':
        return 'Annulée';
      default:
        return etat;
    }
  }

  Color _getEtatColor(String etat) {
    switch (etat) {
      case 'en_attente':
        return Colors.orange;
      case 'en_cours':
        return Colors.blue;
      case 'pret_expedition':
        return Colors.green;
      case 'expedie':
        return Colors.grey;
      case 'annule':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Commandes'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            onPressed: _loadCommandes,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          // Indicateur de filtrage
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.blue.shade50,
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 16, color: Colors.blue.shade700),
                const SizedBox(width: 8),
                Text(
                  'Affichage des commandes actives uniquement',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.blue.shade700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          // Barre de recherche
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Rechercher une commande...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        onPressed: () {
                          _searchController.clear();
                          _searchCommandes('');
                        },
                        icon: const Icon(Icons.clear),
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (value) {
                // Délai pour éviter trop d'appels API
                Future.delayed(const Duration(milliseconds: 500), () {
                  if (value == _searchController.text) {
                    _searchCommandes(value);
                  }
                });
              },
            ),
          ),

          // Liste des commandes
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : _commandes.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.inbox_outlined,
                              size: 64,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isNotEmpty
                                  ? 'Aucune commande trouvée pour "$_searchQuery"'
                                  : 'Aucune commande disponible',
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadCommandes,
                        child: ListView.builder(
                          itemCount: _commandes.length,
                          itemBuilder: (context, index) {
                            final commande = _commandes[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 4,
                              ),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: _getEtatColor(commande.etat),
                                  child: Text(
                                    commande.numeroCommande.substring(0, 2).toUpperCase(),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                title: Text(
                                  commande.numeroCommande,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (commande.client != null)
                                      Text(commande.client!.name),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 2,
                                          ),
                                          decoration: BoxDecoration(
                                            color: _getEtatColor(commande.etat),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            _getEtatLabel(commande.etat),
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '${(commande.progression ?? 0).toStringAsFixed(0)}%',
                                          style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                trailing: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      '${(commande.totalTtc ?? 0).toStringAsFixed(2)} €', 
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Icon(
                                      Icons.arrow_forward_ios,
                                      size: 16,
                                      color: Colors.grey,
                                    ),
                                  ],
                                ),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => CommandeDetailScreen(
                                        commandeId: commande.id,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}