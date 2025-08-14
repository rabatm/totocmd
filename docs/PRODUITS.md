# Gestion des Produits - Synchronisation Extrabat

## 📋 Vue d'ensemble

Le système de gestion des produits permet de synchroniser automatiquement votre
catalogue de produits entre l'API Extrabat et votre base de données Supabase.
Cette fonctionnalité offre une gestion complète des produits avec recherche,
filtrage et synchronisation en temps réel.

## 🏗️ Architecture

### 1. Modèle de données

Le système utilise deux interfaces principales :

- **`ExtrabatProduit`** : Interface pour les données brutes de l'API Extrabat
- **`Produit`** : Interface simplifiée et optimisée pour Supabase

### 2. Composants principaux

```
/hooks/
├── useProduits.ts           # Queries pour récupérer les produits
└── useProduitsMutations.ts  # Mutations pour modifier les produits

/lib/
└── extrabatSync.ts          # Service de synchronisation Extrabat

/components/
├── ProductSelect.tsx        # Sélecteur de produits avec recherche
└── /app/produits/page.tsx   # Page principale de gestion

/scripts/
└── test-sync.js            # Script de test de synchronisation
```

## 🚀 Installation et configuration

### 1. Base de données

Exécutez le script SQL pour créer la table des produits :

```sql
-- Exécuter le contenu de setup-produits-supabase.sql dans votre console Supabase
```

### 2. Variables d'environnement

Créez un fichier `.env.local` avec :

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuration Extrabat API
EXTRABAT_API_URL=https://api.extrabat.com/v1
EXTRABAT_API_KEY=your_extrabat_api_key
```

### 3. Test de la synchronisation

```bash
# Tester la connexion et la synchronisation
node scripts/test-sync.js
```

## 📊 Fonctionnalités

### 1. Synchronisation automatique

- **Récupération** : Télécharge tous les produits depuis l'API Extrabat
- **Transformation** : Convertit les données au format Supabase optimisé
- **Upsert** : Met à jour ou insère les produits (évite les doublons)
- **Logging** : Enregistre toutes les opérations de synchronisation

### 2. Gestion des produits

- **Recherche** : Par code, libellé ou description
- **Filtrage** : Par famille, stock, statut
- **Tri** : Alphabétique par défaut
- **Actions** : Voir, modifier, archiver, supprimer

### 3. Interface utilisateur

- **Dashboard** : Statistiques globales (total, stock, prix)
- **Table** : Liste paginée avec filtres avancés
- **Sélecteur** : Composant réutilisable pour les formulaires

## 🔄 Utilisation de la synchronisation

### Dans l'interface

1. Allez sur `/produits`
2. Cliquez sur "Synchroniser"
3. Attendez la fin de la synchronisation

### Par programmation

```typescript
import { ExtrabatSyncService } from '@/lib/extrabatSync';

const syncService = new ExtrabatSyncService();
const result = await syncService.syncProduitsToSupabase();
console.log(result); // { success: true, created: 150, updated: 25, errors: 0 }
```

### Via les hooks React

```typescript
import { useSyncProduitsMutation } from '@/hooks/useProduitsMutations';

const MyComponent = () => {
  const syncMutation = useSyncProduitsMutations();

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      // Succès !
    } catch (error) {
      // Gérer l'erreur
    }
  };
};
```

## 📋 Schema de la base de données

La table `produits` contient :

### Champs principaux

- `id` : ID unique Extrabat (entier)
- `code` : Code produit Extrabat
- `libelle` : Nom du produit
- `description` : Description détaillée
- `prix` : Prix unitaire

### Informations de stock

- `tenue_stock` : Produit géré en stock
- `stock_physique` : Quantité en stock
- `stock_mini` / `stock_maxi` : Seuils d'alerte

### Catégorisation

- `famille_id` / `famille_libelle` : Famille de produits
- `sous_famille_id` / `sous_famille_libelle` : Sous-famille
- `article_type_id` / `article_type_libelle` : Type d'article

### Métadonnées

- `archived` : Produit archivé
- `is_manuel` : Produit créé manuellement (non Extrabat)
- `last_sync` : Dernière synchronisation
- `created_at` / `updated_at` : Horodatage

## 🔍 Hooks disponibles

### Queries (lecture)

```typescript
// Récupérer tous les produits avec filtres
const { data: produits } = useProduits({
  search: 'moteur',
  familleId: 123,
  tenueStock: true,
  limit: 50,
});

// Récupérer un produit par ID
const { data: produit } = useProduit(productId);

// Récupérer les familles
const { data: familles } = useFamilles();

// Récupérer les sous-familles d'une famille
const { data: sousFamilles } = useSousFamilles(familleId);

// Statistiques des produits
const { data: stats } = useProduitsStats();
```

### Mutations (écriture)

```typescript
// Synchroniser depuis Extrabat
const syncMutation = useSyncProduitsMutation();

// Créer un produit manuel
const createMutation = useCreateProduitMutation();

// Mettre à jour un produit
const updateMutation = useUpdateProduitMutation();

// Supprimer un produit
const deleteMutation = useDeleteProduitMutation();

// Mise à jour de prix en lot
const bulkPriceMutation = useBulkUpdatePrixMutation();

// Archiver/désarchiver
const archiveMutation = useArchiveProduitsMutation();
```

## 🎯 Exemples d'utilisation

### Sélection de produit dans un formulaire

```typescript
import { ProductSelect } from '@/components/ProductSelect';

const MyForm = () => {
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);

  return (
    <ProductSelect
      value={selectedProduit?.id}
      onSelect={setSelectedProduit}
      familleId={123} // Optionnel : filtrer par famille
      showStock={true} // Afficher les infos de stock
    />
  );
};
```

### Recherche avec filtres

```typescript
const ProductsList = () => {
  const [search, setSearch] = useState('');
  const [familleId, setFamilleId] = useState<number>();

  const { data: produits, isLoading } = useProduits({
    search,
    familleId,
    tenueStock: true,
  });

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher..."
      />
      {/* Liste des produits */}
    </div>
  );
};
```

## 🚨 Gestion d'erreurs

Le système gère automatiquement :

- **Erreurs réseau** : Retry automatique avec backoff
- **Erreurs de validation** : Messages détaillés
- **Conflits de données** : Résolution intelligente
- **Limites d'API** : Respect des quotas

Toutes les erreurs sont loggées dans la table `sync_logs`.

## 🔧 Maintenance

### Logs de synchronisation

```sql
-- Voir les dernières synchronisations
SELECT * FROM sync_logs
ORDER BY created_at DESC
LIMIT 10;

-- Statistiques de synchronisation
SELECT
  DATE(created_at) as date,
  COUNT(*) as nb_sync,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successes,
  SUM(CASE WHEN success THEN 0 ELSE 1 END) as errors
FROM sync_logs
WHERE entity_type = 'produit'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Nettoyage des données

```sql
-- Archiver les anciens logs (> 30 jours)
UPDATE sync_logs
SET archived = true
WHERE created_at < NOW() - INTERVAL '30 days';

-- Supprimer les produits manuels non utilisés
DELETE FROM produits
WHERE is_manuel = true
AND id NOT IN (SELECT DISTINCT produit_id FROM commande_produits);
```

## 📈 Performance

### Index optimisés

La table `produits` inclut des index pour :

- Recherche textuelle (`libelle`, `code`, `description`)
- Filtrage par famille (`famille_id`)
- État du stock (`tenue_stock`, `stock_physique`)
- Synchronisation (`last_sync`, `is_manuel`)

### Cache intelligent

Les hooks utilisent React Query pour :

- **Cache automatique** : Évite les requêtes redondantes
- **Invalidation** : Mise à jour après mutations
- **Optimistic updates** : Interface réactive
- **Background refetch** : Données toujours fraîches

## 🔮 Évolutions futures

- **Synchronisation incrémentale** : Seuls les produits modifiés
- **Webhooks Extrabat** : Synchronisation en temps réel
- **Import/Export CSV** : Gestion de catalogues externes
- **Images produits** : Synchronisation des visuels
- **Historique des prix** : Suivi des évolutions tarifaires
