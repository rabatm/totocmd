# Synchronisation des clients ExtraBat

## Vue d'ensemble

Ce système permet de synchroniser automatiquement les clients depuis ExtraBat vers la base de données Supabase.

## Architecture

### Fichiers créés

1. **`lib/syncExtrabatClients.ts`** - Logique de synchronisation
   - Récupération paginée des clients depuis ExtraBat
   - Normalisation des données
   - Insertion/mise à jour dans Supabase

2. **`app/api/sync/clients/route.ts`** - API endpoint
   - POST `/api/sync/clients` - Déclenche la synchronisation
   - GET `/api/sync/clients` - Statut de la dernière sync

3. **`components/SyncExtrabatClientsButton.tsx`** - Bouton UI
   - Bouton pour déclencher la sync
   - Dialog avec résultats détaillés

## Configuration requise

Variables d'environnement dans `.env.local` :

```env
EXTRABAT_API_URL=https://votre-api.extrabat.com
EXTRABAT_API_KEY=votre_cle_api_extrabat
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

## Structure de la table `clients`

```sql
create table public.clients (
  id serial not null,
  extrabat_id character varying(255) not null,
  name character varying(255) not null,
  email character varying(255) null,
  phone character varying(100) null,
  address text null,
  city character varying(255) null,
  postal_code character varying(20) null,
  country character varying(100) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint clients_pkey primary key (id),
  constraint clients_extrabat_id_key unique (extrabat_id)
);
```

## Utilisation

### Via l'interface utilisateur

1. Ajoutez le bouton dans votre page (ex: dashboard) :

```tsx
import SyncExtrabatClientsButton from '@/components/SyncExtrabatClientsButton';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <SyncExtrabatClientsButton />
    </div>
  );
}
```

2. Cliquez sur "Sync ExtraBat"
3. Consultez les résultats dans le dialog

### Via l'API directement

```bash
curl -X POST http://localhost:3000/api/sync/clients
```

### Programmatiquement

```typescript
import { syncExtrabatClientsToSupabase } from '@/lib/syncExtrabatClients';

const result = await syncExtrabatClientsToSupabase();
console.log(result);
// {
//   success: true,
//   total: 150,
//   inserted: 10,
//   updated: 140,
//   errors: 0,
//   message: "✅ Synchronisation terminée: 10 ajoutés, 140 mis à jour, 0 erreurs"
// }
```

## Fonctionnement

### 1. Récupération depuis ExtraBat

- Pagination automatique (50 clients par page)
- Retry automatique (3 tentatives max)
- Timeout de 30 secondes par requête
- Pause de 200ms entre chaque page

### 2. Normalisation des données

Mapping des champs ExtraBat → Supabase :

| ExtraBat | Supabase |
|----------|----------|
| `cli_id` ou `extrabat_id` | `extrabat_id` |
| `cli_nom` + `cli_prenom` | `name` |
| `cli_email` | `email` |
| `cli_mobile` ou `cli_tel` | `phone` |
| `cli_adresse` | `address` |
| `cli_ville` | `city` |
| `cli_cp` | `postal_code` |
| `cli_pays` | `country` |

### 3. Synchronisation dans Supabase

- **Upsert logique** :
  - Si `extrabat_id` existe → UPDATE
  - Si `extrabat_id` n'existe pas → INSERT
- Traitement par lots de 50 clients
- Mise à jour du champ `updated_at`

## Gestion des erreurs

- **Erreur de configuration** : Variables d'env manquantes
- **Erreur API ExtraBat** : Retry automatique (3×)
- **Erreur Supabase** : Enregistrée, compte des erreurs
- **Timeout** : 30 secondes max par requête

## Performances

- **Petite base (< 100 clients)** : ~5-10 secondes
- **Base moyenne (100-500)** : ~20-60 secondes
- **Grande base (> 500)** : ~2-5 minutes

## Logs

Les logs sont affichés dans la console :

```
🔄 Début de la synchronisation des clients ExtraBat...
📥 150 clients récupérés depuis ExtraBat
📦 Traitement du lot 1/3
📦 Traitement du lot 2/3
📦 Traitement du lot 3/3
✅ Synchronisation terminée: 10 ajoutés, 140 mis à jour, 0 erreurs
```

## Améliorations futures

- [ ] Synchronisation incrémentale (seulement les modifiés)
- [ ] Table de logs des synchronisations
- [ ] Planification automatique (cron job)
- [ ] Gestion des suppressions (soft delete)
- [ ] Synchronisation bidirectionnelle
- [ ] Webhooks ExtraBat pour sync en temps réel

## Dépannage

### "Configuration Extrabat manquante"
→ Vérifiez vos variables d'environnement dans `.env.local`

### "API Error: 401"
→ Votre clé API ExtraBat (EXTRABAT_API_KEY) est invalide ou expirée

### "Duplicate key error"
→ Un `extrabat_id` existe déjà, la contrainte UNIQUE est violée

### Synchronisation lente
→ Réduisez `nbitem` de 50 à 25 dans `syncExtrabatClients.ts`

## Support

Pour toute question ou problème, consultez les logs dans la console du navigateur et du serveur.
