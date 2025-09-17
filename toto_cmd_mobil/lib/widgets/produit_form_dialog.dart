import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/models.dart';

class ProduitFormDialog extends StatefulWidget {
  final CommandeProduit? produit;

  const ProduitFormDialog({
    super.key,
    this.produit,
  });

  @override
  State<ProduitFormDialog> createState() => _ProduitFormDialogState();
}

class _ProduitFormDialogState extends State<ProduitFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nomProduitController = TextEditingController();
  final _codeProduitController = TextEditingController();
  final _numeroSerieController = TextEditingController();
  final _quantiteController = TextEditingController();

  bool get _isEditing => widget.produit != null;

  @override
  void initState() {
    super.initState();

    if (_isEditing) {
      _nomProduitController.text = widget.produit!.nomProduit;
      _codeProduitController.text = widget.produit!.codeProduit ?? '';
      _numeroSerieController.text = widget.produit!.numeroSerie;
      _quantiteController.text = widget.produit!.quantite.toString();
    } else {
      _quantiteController.text = '1';
    }
  }

  @override
  void dispose() {
    _nomProduitController.dispose();
    _codeProduitController.dispose();
    _numeroSerieController.dispose();
    _quantiteController.dispose();
    super.dispose();
  }

  void _scanSerialNumber() {
    // Simuler un scan ou ouvrir le scanner
    // Pour l'instant, on va juste mettre le focus sur le champ
    _numeroSerieController.clear();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Scanner le numéro de série'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.qr_code_scanner,
              size: 64,
              color: Colors.blue,
            ),
            SizedBox(height: 16),
            Text(
              'Scannez le code-barres du produit ou saisissez le numéro de série manuellement.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Fermer'),
          ),
        ],
      ),
    );
  }

  void _submitForm() {
    if (_formKey.currentState?.validate() ?? false) {
      final result = {
        'nomProduit': _nomProduitController.text.trim(),
        'codeProduit': _codeProduitController.text.trim().isEmpty
            ? null
            : _codeProduitController.text.trim(),
        'numeroSerie': _numeroSerieController.text.trim(),
        'quantite': int.tryParse(_quantiteController.text) ?? 1,
      };

      Navigator.of(context).pop(result);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(_isEditing ? 'Modifier le produit' : 'Ajouter un produit'),
      content: SizedBox(
        width: double.maxFinite,
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Nom du produit
              TextFormField(
                controller: _nomProduitController,
                decoration: const InputDecoration(
                  labelText: 'Nom du produit *',
                  hintText: 'Ex: MacBook Pro 14"',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Le nom du produit est requis';
                  }
                  return null;
                },
                textCapitalization: TextCapitalization.words,
              ),

              const SizedBox(height: 16),

              // Code produit (optionnel)
              TextFormField(
                controller: _codeProduitController,
                decoration: const InputDecoration(
                  labelText: 'Code produit',
                  hintText: 'Ex: MBP14-001',
                  border: OutlineInputBorder(),
                ),
                textCapitalization: TextCapitalization.characters,
              ),

              const SizedBox(height: 16),

              // Numéro de série avec bouton scan
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _numeroSerieController,
                      decoration: const InputDecoration(
                        labelText: 'Numéro de série *',
                        hintText: 'Scannez ou saisissez le SN',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Le numéro de série est requis';
                        }
                        return null;
                      },
                      textCapitalization: TextCapitalization.characters,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _scanSerialNumber,
                    icon: const Icon(Icons.qr_code_scanner),
                    tooltip: 'Scanner le numéro de série',
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Quantité
              TextFormField(
                controller: _quantiteController,
                decoration: const InputDecoration(
                  labelText: 'Quantité *',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'La quantité est requise';
                  }
                  final quantite = int.tryParse(value);
                  if (quantite == null || quantite <= 0) {
                    return 'La quantité doit être supérieure à 0';
                  }
                  return null;
                },
              ),

              if (_isEditing) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Informations actuelles:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Statut: ${widget.produit!.statut}',
                        style: const TextStyle(fontSize: 12),
                      ),
                      if (widget.produit!.dateScan != null)
                        Text(
                          'Scanné le: ${widget.produit!.dateScan}',
                          style: const TextStyle(fontSize: 12),
                        ),
                    ],
                  ),
                ),
              ],
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
          onPressed: _submitForm,
          child: Text(_isEditing ? 'Modifier' : 'Ajouter'),
        ),
      ],
    );
  }
}