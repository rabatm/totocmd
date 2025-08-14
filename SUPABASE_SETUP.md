# TotoCmd - Configuration Supabase

## 🚀 Configuration rapide

### 1. Obtenir les clés Supabase

1. **Allez sur votre dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** (wsrcjuknxapuxifhdrfb)
3. **Allez dans Settings > API**
4. **Copiez les valeurs suivantes** :
   - **URL du projet** : `https://wsrcjuknxapuxifhdrfb.supabase.co`
   - **Clé anon/public** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (commence
     par eyJ)

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.local.example .env.local
```

Modifiez le fichier `.env.local` avec vos vraies clés :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wsrcjuknxapuxifhdrfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre-vraie-clé-ici
```

### 3. Redémarrer le serveur

```bash
npm run dev
```

## 🗄️ Structure de la base de données

L'application s'attend à trouver ces tables dans Supabase :

### Table `client`

```sql
CREATE TABLE client (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  extrabat_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Table `personnel`

```sql
CREATE TABLE personnel (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nom text NOT NULL,
  prenom text NOT NULL,
  avatar text,
  auto_created boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Table `commande`

```sql
CREATE TABLE commande (
  id text PRIMARY KEY,
  client_id integer REFERENCES client(id),
  numero_commande text NOT NULL UNIQUE,
  date_commande timestamptz,
  date_limite_expedition timestamptz,
  acompte_verse numeric DEFAULT 0,
  etat text DEFAULT 'en_attente' CHECK (etat IN ('en_attente', 'en_preparation', 'prete', 'expedie', 'annulee')),
  progression integer DEFAULT 0 CHECK (progression >= 0 AND progression <= 100),
  expedition_id integer REFERENCES personnel(id),
  remarque text,
  total_ttc numeric NOT NULL,
  total_ht numeric,
  total_tva numeric,
  extrabat_id text,
  mode_reglement text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Table `commande_produit`

```sql
CREATE TABLE commande_produit (
  id text PRIMARY KEY,
  commande_id text REFERENCES commande(id) ON DELETE CASCADE,
  personnel_id integer REFERENCES personnel(id),
  nom_produit text NOT NULL,
  code_produit text,
  numero_serie text,
  quantite integer DEFAULT 1,
  statut text DEFAULT 'scanne' CHECK (statut IN ('scanne', 'prepare', 'expedie', 'non_disponible')),
  date_scan timestamptz DEFAULT now(),
  remarque text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🔧 Test de la connexion

Allez sur http://localhost:3000/commandes pour voir l'état de la connexion
Supabase.

## 🆘 Résolution des problèmes

### Erreur "Invalid API key"

- Vérifiez que vous utilisez la clé **anon/public** (pas la service key)
- La clé doit commencer par `eyJ`
- Redémarrez le serveur après modification de .env.local

### Erreur "relation does not exist"

- Vérifiez que les tables existent dans votre base Supabase
- Utilisez le SQL Editor de Supabase pour créer les tables

### Erreur de permissions

- Vérifiez les RLS (Row Level Security) policies dans Supabase
- Pour les tests, vous pouvez temporairement désactiver RLS sur les tables

## 📱 Prochaines étapes

Une fois la connexion établie :

1. Créer des données de test dans les tables
2. Tester l'affichage des commandes
3. Implémenter la création de nouvelles commandes
4. Ajouter la gestion temps réel
