# Copilot Instructions for totocmd (Order Management) — with Supabase

## 🧩 Modularité & Composants Réutilisables

- Structure les composants pour qu’ils soient réutilisables et découplés : privilégie des composants UI génériques (boutons, inputs, tables, modals) dans `/components/`.
- Pour chaque entité métier (commande, client, produit, ligne), crée des composants dédiés : ex : `OrderForm`, `ClientSelect`, `ProductTable`, `OrderLineStatus`.
- Utilise les patterns de composition React (props.children, render props, hooks personnalisés) pour maximiser la réutilisabilité.
- Centralise la logique de requête (fetch, mutation) dans des hooks personnalisés (`useOrders`, `useClients`, etc.) dans `/lib/` ou `/hooks/`.
- Préfère la configuration (props, options) à la duplication de code pour les variantes de composants (ex : table filtrée, modal éditable).
- Exemples :
  - Un composant `OrderLineStatus` gère l’affichage et la modification du statut d’une ligne de commande, réutilisable dans plusieurs vues.
  - Un composant `ProductSelect` (combobox) utilisé dans le formulaire de création de commande et d’édition de ligne.
  - Un hook `useRealtimeOrders` encapsule la souscription Supabase pour les updates en temps réel.

🚀 **Project Overview**

- **Framework**: Next.js (App Router, TypeScript)
- **UI Library**: shadcn/ui (pour tous les composants)
- **Backend/DB**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **State Management**:
  - React Query (pour requêtes & cache)
  - Zustand (pour état local/global)
- **Data Models**: TypeScript interfaces synchronisées avec les tables Supabase (voir `todo.md` + schéma Supabase)
- **API**:
  - Lecture/écriture via Supabase client (`@supabase/supabase-js`)
  - API routes Next.js : uniquement pour logique server-side spécifique (ex : proxy, vérifications, enrichissement)

🧩 **Supabase Integration**

**Setup :**

- Crée ton projet Supabase sur le dashboard Supabase
- Place les variables d’environnement dans `.env.local` :
  ```env
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```
- Installe le client :
  ```bash
  npm install @supabase/supabase-js
  ```
- Initialise Supabase dans `/lib/supabaseClient.ts` :

  ```ts
  import { createClient } from '@supabase/supabase-js';

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```

**Typage :**

- Génére les types à partir de Supabase (studio ou CLI) pour une correspondance stricte entre tes interfaces et la base (ex : `Database`).
- Utilise ces types dans tes queries et hooks pour la sécurité type.
- Découpage des fichiers :
  - `/lib/supabaseClient.ts`: Initialisation client Supabase
  - `/src/types/supabase.ts`: Types générés à partir du schéma Supabase
  - `/app/`, `/components/`: Requêtes via React Query, hooks, ou server actions

🛠️ **Developer Workflows (avec Supabase)**

- Toutes les lectures/écritures de données passent par Supabase :
  - Authentification utilisateur (auth intégré Supabase)
  - Création/édition commandes, produits, clients : direct via Supabase
  - Souscriptions en temps réel : exploite Supabase Realtime (pour dashboard dynamique)
- Pour server actions, tu peux soit utiliser Supabase côté serveur (server action Next) soit côté client.
- Structure et noms de tables/colonnes = alignés aux modèles TS (`commande`, `client`, `ligne_commande`, ...)

💡 **Conventions et fonctionnalités clés**

- **State Management** :
  - Stocke le minimum en Zustand, utilise React Query avec Supabase pour la data.
  - Privilégie le rechargement temps réel via `supabase.from(...).on(...)` pour les listes.
- **Auth** :
  - Utilise Supabase Auth (stocke session côté client, protège les routes si besoin).
- **Data Models synchronisés** :
  - Modifie le schéma dans Supabase, mets à jour les interfaces TS générées.
  - String enums pour les statuts, alignés Supabase/TS.

## 📋 Gestion du fichier `todo.md`

- Avant de commencer une tâche, décris précisément dans `todo.md` ce que tu vas faire (objectifs, étapes, hypothèses si besoin).
- Une fois la tâche terminée, mets à jour `todo.md` pour indiquer ce qui a été fait et ce qu’il reste à faire (prochaines étapes, points bloquants, TODOs restants).
- Utilise ce fichier comme source de vérité pour le suivi de l’avancement et la communication entre contributeurs.

## 🧪 Tests unitaires

- Écris des tests unitaires pour chaque hook, utilitaire et composant critique (ex : logique métier, hooks de requête, composants de formulaire).
- Place les fichiers de test à côté du code testé (`.test.ts`, `.test.tsx`).
- Utilise Jest, Testing Library ou Vitest selon la stack du projet.
- Cible la logique métier, la gestion des statuts, et les cas limites (ex : transitions de statut, validation de formulaire, rendu conditionnel PC).

## 🧼 Clean Code

- Privilégie la lisibilité, la simplicité et la cohérence du code.
- Découpe les fonctions et composants trop longs en unités plus petites et nommées.
- Typage strict TypeScript partout (évite les `any`).
- Nomme explicitement les props, hooks, et variables métier.
- Ajoute des commentaires uniquement pour expliquer la logique métier ou les choix non triviaux.
- Respecte la structure modulaire : pas de logique métier dans les composants UI purs.

## 🔗 Résumé des points d’intégration

- Supabase = source de vérité pour données, auth & realtime
- Tous les modèles et queries sont typés grâce aux types générés
- Respecte la structure Next.js + conventions shadcn/ui
- Pour tout ajout de données ou workflow, réfléchis d’abord aux modifications dans Supabase, puis propage aux types et composants.

🔗 Pour plus d’exemples, vois [docs Supabase Next.js], [starter kits], et l’exemple de workflow dans `todo.md`.
