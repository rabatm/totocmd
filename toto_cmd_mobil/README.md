# TotoCMD Mobile - Application Mobile de Gestion des Commandes

Une application Flutter pour la gestion mobile des commandes avec intégration du scanner Zebra TC.

## Fonctionnalités

- ✅ Sélection d'une commande existante
- ✅ Recherche et sélection de produits
- ✅ Scan de numéros de série avec Zebra TC scanner
- ✅ Ajout automatique de produits aux commandes
- ✅ Synchronisation en temps réel avec Supabase

## Configuration

### 1. Dépendances Flutter

Les dépendances suivantes sont déjà configurées dans `pubspec.yaml` :

```yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.0.0
  provider: ^6.0.0
  flutter_datawedge: ^1.0.0
  flutter_slidable: ^3.0.0
```

### 2. Configuration Supabase

Remplacez les valeurs dans `lib/main.dart` et `lib/services/supabase_service.dart` :

```dart
// Dans lib/main.dart
await Supabase.initialize(
  url: 'VOTRE_SUPABASE_URL',
  anonKey: 'VOTRE_SUPABASE_ANON_KEY',
);

// Dans lib/services/supabase_service.dart
static const String supabaseUrl = 'VOTRE_SUPABASE_URL';
static const String supabaseAnonKey = 'VOTRE_SUPABASE_ANON_KEY';
```

### 3. Permissions Android

Ajoutez ces permissions dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Utilisation

### Démarrage de l'application

1. Lancez l'application sur un appareil Android avec Zebra TC scanner
2. L'application initialise automatiquement Supabase et le scanner

### Workflow typique

1. **Sélection de commande** : Appuyez sur "Sélectionner une Commande"
2. **Recherche** : Utilisez la barre de recherche pour trouver une commande par numéro
3. **Sélection produit** : Choisissez un produit dans la liste
4. **Scan** : Appuyez sur le bouton flottant pour activer le scanner
5. **Scan du SN** : Scannez le numéro de série avec le Zebra TC
6. **Ajout automatique** : Le produit est automatiquement ajouté à la commande

## Architecture

```
lib/
├── models/           # Modèles de données
│   ├── commande.dart
│   ├── produit.dart
│   ├── commande_produit.dart
│   └── models.dart
├── services/         # Services métier
│   ├── supabase_service.dart
│   ├── zebra_scanner_service.dart
│   └── services.dart
├── providers/        # Gestion d'état
│   ├── app_state.dart
│   └── providers.dart
├── screens/          # Interfaces utilisateur
│   ├── home_screen.dart
│   ├── commande_selection_screen.dart
│   ├── produit_addition_screen.dart
│   └── screens.dart
└── main.dart         # Point d'entrée
```

## Modèles de données

### Commande
- `id`: Identifiant unique
- `numeroCommande`: Numéro de commande
- `client`: Client associé
- `etat`: État de la commande
- `commandeProduits`: Liste des produits

### Produit
- `id`: Identifiant unique
- `code`: Code produit
- `libelle`: Nom du produit
- `prix`: Prix unitaire

### CommandeProduit
- `id`: Identifiant unique
- `commandeId`: ID de la commande
- `produitId`: ID du produit
- `numeroSerie`: Numéro de série scanné
- `statut`: Statut (SCANNÉ, RESERVE, etc.)

## Services

### SupabaseService
- `getCommandes()`: Récupère toutes les commandes
- `searchCommandes(query)`: Recherche de commandes
- `getProduits()`: Récupère tous les produits
- `addProduitToCommande()`: Ajoute un produit à une commande

### ZebraScannerService
- `initialize()`: Initialise le scanner
- `setScanCallback(callback)`: Définit le callback de scan
- `enableScanner()` / `disableScanner()`: Contrôle du scanner

## État de l'application

L'état est géré via Provider avec la classe `AppState` :
- `selectedCommande`: Commande actuellement sélectionnée
- `selectedProduit`: Produit actuellement sélectionné
- `scannedData`: Dernières données scannées
- `isScanning`: État du scanner

## Tests

Pour tester l'application :

1. **Test Supabase** : Vérifiez que les données se synchronisent
2. **Test Scanner** : Testez le scan de codes-barres
3. **Test Workflow** : Testez le workflow complet d'ajout de produit

## Déploiement

### Build pour Android
```bash
flutter build apk --release
```

### Installation sur Zebra TC
1. Transférez l'APK sur l'appareil
2. Installez l'application
3. Configurez les permissions nécessaires

## Support

Pour les problèmes :
1. Vérifiez les logs de l'application
2. Vérifiez la configuration Supabase
3. Testez sur un appareil physique avec scanner

## TODO

- [ ] Configuration Supabase (URLs et clés)
- [ ] Tests sur périphérique Zebra
- [ ] Gestion d'erreurs améliorée
- [ ] Cache hors ligne
- [ ] Synchronisation en temps réel
- [ ] Interface utilisateur améliorée
