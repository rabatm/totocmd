import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:developer' as developer;

class EnvConfig {
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';

  // Helper pour vérifier si on est en développement
  static bool get isDevelopment => apiBaseUrl.contains('localhost');

  // Helper pour vérifier si on est en production
  static bool get isProduction => !isDevelopment;

  // Initialiser la configuration
  static Future<void> initialize() async {
    await dotenv.load(fileName: '.env');
  }

  // Afficher la configuration actuelle (pour debug)
  static void printConfig() {
    developer.log('=== CONFIGURATION ENV ===', name: 'EnvConfig');
    developer.log('API Base URL: $apiBaseUrl', name: 'EnvConfig');
    developer.log('Environment: ${isDevelopment ? 'Development' : 'Production'}', name: 'EnvConfig');
    developer.log('Supabase URL: ${supabaseUrl.isNotEmpty ? 'Configured' : 'Not configured'}', name: 'EnvConfig');
    developer.log('========================', name: 'EnvConfig');
  }
}