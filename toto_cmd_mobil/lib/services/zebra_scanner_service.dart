import 'package:flutter_datawedge/flutter_datawedge.dart';
import 'dart:developer' as developer;
import 'dart:async';

class ZebraScannerService {
  static final ZebraScannerService _instance = ZebraScannerService._internal();
  factory ZebraScannerService() => _instance;
  ZebraScannerService._internal();

  late FlutterDataWedge _dataWedge;
  Function(String)? _onScanResult;
  bool _isInitialized = false;
  StreamSubscription<ScanResult>? _scanSubscription;

  Future<void> initialize() async {
    try {
      developer.log('🔄 Initialisation DataWedge avec profil...', name: 'ZebraScannerService');

      _dataWedge = FlutterDataWedge();
      await _dataWedge.initialize();
      await _dataWedge.createDefaultProfile(profileName: "AMOPI Scan");

      _scanSubscription = _dataWedge.onScanResult.listen((ScanResult result) {
        developer.log('✅ Scan reçu: ${result.data}', name: 'ZebraScannerService');
        if (_onScanResult != null) {
          _onScanResult!(result.data);
        }
      });

      _isInitialized = true;
      developer.log('✅ DataWedge initialisé avec succès avec profil AMOPI Scan', name: 'ZebraScannerService');
    } catch (e) {
      developer.log('❌ Erreur initialisation scanner: $e', name: 'ZebraScannerService', error: e);
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
        developer.log('✅ Scanner activé', name: 'ZebraScannerService');
      } else {
        developer.log('⚠️ Scanner non initialisé', name: 'ZebraScannerService');
      }
    } catch (e) {
      developer.log('❌ Erreur activation scanner: $e', name: 'ZebraScannerService', error: e);
    }
  }

  Future<void> disableScanner() async {
    try {
      if (_isInitialized) {
        await _dataWedge.enableScanner(false);
        developer.log('⏹️ Scanner désactivé', name: 'ZebraScannerService');
      }
    } catch (e) {
      developer.log('❌ Erreur désactivation scanner: $e', name: 'ZebraScannerService', error: e);
    }
  }

  // Méthode pour simuler un scan (utile pour les tests)
  void simulateScan(String data) {
    developer.log('🧪 Simulation scan: $data', name: 'ZebraScannerService');
    if (_onScanResult != null) {
      _onScanResult!(data);
    }
  }

  // Getters
  bool get isInitialized => _isInitialized;

  void dispose() {
    _scanSubscription?.cancel();
    _isInitialized = false;
  }
}