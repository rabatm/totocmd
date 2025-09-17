import 'package:flutter/material.dart';
import '../models/models.dart';

class ProduitEditDialog extends StatefulWidget {
  final CommandeProduit produit;

  const ProduitEditDialog({
    super.key,
    required this.produit,
  });

  @override
  State<ProduitEditDialog> createState() => _ProduitEditDialogState();
}

class _ProduitEditDialogState extends State<ProduitEditDialog> {
  late TextEditingController _nomController;
  late TextEditingController _codeController;
  late TextEditingController _numeroSerieController;
  late TextEditingController _quantiteController;
  String _selectedStatut = 'scanne';

  final List<Map<String, String>> _statuts = [
    {'value': 'scanne', 'label': 'Scanné'},
    {'value': 'en_preparation', 'label': 'En préparation'},
    {'value': 'pret_expedition', 'label': 'Prêt expédition'},
    {'value': 'expedie', 'label': 'Expédié'},
    {'value': 'livre', 'label': 'Livré'},
  ];

  @override
  void initState() {
    super.initState();
    _nomController = TextEditingController(text: widget.produit.nomProduit);
    _codeController = TextEditingController(text: widget.produit.codeProduit ?? '');
    _numeroSerieController = TextEditingController(text: widget.produit.numeroSerie);
    _quantiteController = TextEditingController(text: widget.produit.quantite.toString());
    _selectedStatut = widget.produit.statut;
  }

  @override
  void dispose() {
    _nomController.dispose();
    _codeController.dispose();
    _numeroSerieController.dispose();
    _quantiteController.dispose();
    super.dispose();
  }

  void _saveChanges() {
    final quantite = int.tryParse(_quantiteController.text) ?? 1;
    
    if (_nomController.text.trim().isEmpty || _numeroSerieController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Le nom du produit et le numéro de série sont obligatoires'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    Navigator.of(context).pop({
      'nomProduit': _nomController.text.trim(),
      'codeProduit': _codeController.text.trim().isEmpty ? null : _codeController.text.trim(),
      'numeroSerie': _numeroSerieController.text.trim(),
      'quantite': quantite,
      'statut': _selectedStatut,
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Modifier le produit'),
      content: SizedBox(
        width: MediaQuery.of(context).size.width * 0.8,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _nomController,
                decoration: const InputDecoration(
                  labelText: 'Nom du produit *',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _codeController,
                decoration: const InputDecoration(
                  labelText: 'Code produit',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _numeroSerieController,
                decoration: const InputDecoration(
                  labelText: 'Numéro de série *',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _quantiteController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Quantité',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedStatut,
                decoration: const InputDecoration(
                  labelText: 'Statut',
                  border: OutlineInputBorder(),
                ),
                items: _statuts.map((statut) {
                  return DropdownMenuItem(
                    value: statut['value'],
                    child: Text(statut['label']!),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedStatut = value;
                    });
                  }
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: _saveChanges,
          child: const Text('Enregistrer'),
        ),
      ],
    );
  }
}