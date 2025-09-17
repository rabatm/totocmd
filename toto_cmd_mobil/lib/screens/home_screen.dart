import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/providers.dart';
import '../services/services.dart';
import 'commandes_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    developer.log('🏠 HomeScreen initialisé', name: 'HomeScreen');
    _initializeServices();
  }

  Future<void> _initializeServices() async {
    try {
      developer.log('🔄 Initialisation des services...', name: 'HomeScreen');

      // Initialiser Supabase
      developer.log('🔄 Initialisation de Supabase...', name: 'HomeScreen');
      await SupabaseService.initialize();
      developer.log('✅ Supabase initialisé', name: 'HomeScreen');

      // Initialiser le scanner Zebra
      developer.log('🔄 Initialisation du scanner Zebra...', name: 'HomeScreen');
      final scannerService = ZebraScannerService();
      await scannerService.initialize();
      developer.log('✅ Scanner Zebra initialisé', name: 'HomeScreen');

      // Configurer le callback du scanner
      scannerService.setScanCallback((data) {
        developer.log('📱 Données scannées reçues: $data', name: 'HomeScreen');
        if (mounted) {
          context.read<AppState>().setScannedData(data);
        }
      });

      developer.log('✅ Tous les services initialisés avec succès', name: 'HomeScreen');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Services initialisés avec succès')),
        );
      }
    } catch (e) {
      developer.log('❌ Erreur lors de l\'initialisation des services: $e', name: 'HomeScreen', error: e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur d\'initialisation: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TotoCMD Mobile'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.inventory_2,
              size: 80,
              color: Colors.blue,
            ),
            const SizedBox(height: 24),
            const Text(
              'Gestion des Commandes',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Sélectionnez une commande et ajoutez des produits avec le scanner',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 48),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const CommandesListScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.list),
              label: const Text('Voir les Commandes'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}