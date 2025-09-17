import 'package:flutter_datawedge/flutter_datawedge.dart';
import 'dart:developer' as developer;

class ZebraScannerService {
  static final ZebraScannerService _instance = ZebraScannerService._internal();
  factory ZebraScannerService() => _instance;
  ZebraScannerService._internal();

  late FlutterDataWedge _dataWedge;
  Function(String)? _onScanResult;
  bool _isInitialized = false;

  Future<void> initialize() async {
    try {
      _dataWedge = FlutterDataWedge();

      // Écouter les scans
      _dataWedge.onScanResult.listen((result) {
        developer.log('Scan reçu: ${result.data}', name: 'ZebraScannerService');
        if (_onScanResult != null) {
          _onScanResult!(result.data);
        }
      });

      _isInitialized = true;
      developer.log('Scanner Zebra initialisé avec succès', name: 'ZebraScannerService');
    } catch (e) {
      developer.log('Erreur initialisation scanner: $e', name: 'ZebraScannerService', error: e);
      // Mode fallback si le scanner ne fonctionne pas
      _isInitialized = false;
    }
  }

  void setScanCallback(Function(String) callback) {
    _onScanResult = callback;
  }

  Future<void> enableScanner() async {
    try {
      if (_isInitialized) {
        await _dataWedge.enableScanner(true);
        developer.log('Scanner activé', name: 'ZebraScannerService');
      }
    } catch (e) {
      developer.log('Erreur activation scanner: $e', name: 'ZebraScannerService', error: e);
    }
  }

  Future<void> disableScanner() async {
    try {
      if (_isInitialized) {
        await _dataWedge.enableScanner(false);
        developer.log('Scanner désactivé', name: 'ZebraScannerService');
      }
    } catch (e) {
      developer.log('Erreur désactivation scanner: $e', name: 'ZebraScannerService', error: e);
    }
  }

  // Méthode pour simuler un scan (utile pour les tests ou fallback)
  void simulateScan(String data) {
    developer.log('Simulation scan: $data', name: 'ZebraScannerService');
    if (_onScanResult != null) {
      _onScanResult!(data);
    }
  }

  bool get isInitialized => _isInitialized;

  void dispose() {
    _isInitialized = false;
  }
}