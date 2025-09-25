import 'package:flutter/material.dart';
import '../services/zebra_scanner_service.dart';

class SnEditDialog extends StatefulWidget {
  final String currentSn;
  final Function(String sn) onSave;

  const SnEditDialog({
    super.key,
    required this.currentSn,
    required this.onSave,
  });

  @override
  State<SnEditDialog> createState() => _SnEditDialogState();
}

class _SnEditDialogState extends State<SnEditDialog> {
  late TextEditingController _snController;
  bool _isScanning = true;
  bool _isManualInput = false;
  final ZebraScannerService _scannerService = ZebraScannerService();

  @override
  void initState() {
    super.initState();
    _snController = TextEditingController(text: widget.currentSn);
    _initializeScanner();
  }

  @override
  void dispose() {
    _scannerService.disableScanner();
    _snController.dispose();
    super.dispose();
  }

  Future<void> _initializeScanner() async {
    await _scannerService.initialize();
    if (_scannerService.isInitialized) {
      _scannerService.setScanCallback(_onScanResult);
      await _scannerService.enableScanner();
    }
  }

  void _onScanResult(String scannedData) {
    if (_isScanning) {
      setState(() {
        _snController.text = scannedData;
      });

      // Feedback visuel
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Code scanné: $scannedData'),
          duration: const Duration(seconds: 2),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _toggleManualInput() {
    setState(() {
      _isManualInput = !_isManualInput;
      _isScanning = !_isManualInput;
    });

    if (_isScanning) {
      _scannerService.enableScanner();
    } else {
      _scannerService.disableScanner();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Modifier Numéro de Série'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mode scan actif
            if (_isScanning && !_isManualInput) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.qr_code_scanner,
                      size: 48,
                      color: Colors.green.shade600,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Scanner prêt',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.green.shade700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Scannez un code-barres avec votre lecteur Zebra',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.green.shade700,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Bouton pour passer en saisie manuelle
              Center(
                child: ElevatedButton.icon(
                  onPressed: _toggleManualInput,
                  icon: const Icon(Icons.keyboard),
                  label: const Text('Saisie manuelle'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[100],
                    foregroundColor: Colors.grey[700],
                  ),
                ),
              ),
            ],

            // Mode saisie manuelle
            if (_isManualInput) ...[
              TextField(
                controller: _snController,
                autofocus: true,
                decoration: InputDecoration(
                  labelText: 'Numéro de Série (SN)',
                  border: const OutlineInputBorder(),
                  suffixIcon: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        onPressed: () {
                          _snController.clear();
                        },
                        icon: const Icon(Icons.clear),
                        tooltip: 'Effacer',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Bouton pour revenir au scan
              Center(
                child: ElevatedButton.icon(
                  onPressed: _toggleManualInput,
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text('Retour au scan'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[100],
                    foregroundColor: Colors.green[700],
                  ),
                ),
              ),
            ],

            // Affichage de la valeur actuelle si elle existe
            if (_snController.text.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Valeur actuelle:',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue.shade600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _snController.text,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.blue.shade800,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: const Text('Annuler'),
        ),
        ElevatedButton(
          onPressed: () {
            final sn = _snController.text.trim();
            if (sn.isEmpty) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Le numéro de série ne peut pas être vide'),
                  backgroundColor: Colors.red,
                ),
              );
              return;
            }

            widget.onSave(sn);
            Navigator.of(context).pop();
          },
          child: const Text('Sauvegarder'),
        ),
      ],
    );
  }
}