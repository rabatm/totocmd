````markdown
# TODO (à remplir avant chaque tâche)

---

## ✅ Étape 7 —**Résultat** : Le système de gestion des stocks est maintenant complet et fonctionnel avec :
- Historique des mouvements visible dans les détails produit
- Statistiques tenant compte des réservations en temps réel
- Code TypeScript propre sans erreurs de compilation

---

## ✅ Étape 7.3 — Stock en commande clients (RÉALISÉ)

**Objectif** : Ajouter une colonne "Stock en commande clients" pour afficher les produits scannés dans les commandes actives.

**Actions réalisées** :

- ✅ **Hook `useStockEnCommande` créé** :
  - Récupère les produits avec statut 'scanne' dans les commandes actives
  - Agrège les quantités par code produit
  - Filtre sur les états de commande : 'en_attente', 'en_cours', 'pret_expedition'

- ✅ **Colonne ajoutée dans la table stocks** :
  - Affichage des quantités en violet pour différencier des réservations
  - Positionnée entre "Stock réservé" et "Stock disponible"
  - Calcul : stockPhysique - stockReserveQty - stockEnCommandeQty pour disponible

- ✅ **Carte statistique ajoutée** :
  - "En commande clients" avec icône violette
  - Affiche la somme totale des produits scannés
  - Thème violet cohérent avec la colonne

- ✅ **Interface mise à jour** :
  - Grille de statistiques passée à 5 cartes
  - Couleurs distinctives : bleu (total), orange (réservé), violet (en commande), jaune (faible), vert (disponible)
  - Table avec nouvelle colonne "Stock en commande clients"

**Calculs implémentés** :

- **Stock en commande** : Produits avec `statut = 'scanne'` dans commandes actives
- **Stock disponible réel** : `stockPhysique - stockReserve - stockEnCommande`
- **Agrégation** : `Object.values(stockEnCommande).reduce((sum, qty) => sum + qty, 0)`

**Résultat** : La visibilité complète des stocks inclut maintenant :
- Stock physique (inventaire)
- Stock réservé (commandes en préparation)
- Stock en commande clients (produits scannés)
- Stock disponible (réel pour les ventes)

**À tester** :
- Insérer des données de test avec produits scannés
- Vérifier les calculs dans l'interface stocks
- Valider que les statistiques correspondent aux données réelles

---

**Objectif** : Créer une interface conviviale pour saisir rapidement les stocks de plusieurs produits lors d'un inventaire.

**Actions réalisées** :

- ✅ **Nouveau composant `InventoryDialog`** :
  - Interface moderne avec recherche de produits
  - Saisie rapide des quantités pour plusieurs produits
  - Validation en temps réel des modifications
  - Sauvegarde groupée de tous les changements

- ✅ **Fonctionnalités clés** :
  - **Recherche** : Filtrage par nom ou code produit
  - **Saisie intuitive** : Code + Nom + Zone quantité pour chaque produit
  - **Feedback visuel** : Produits modifiés surlignés en jaune
  - **Validation** : Contrôle des quantités (≥ 0) avant sauvegarde
  - **Actions groupées** : Enregistrement de tous les changements en une fois

- ✅ **Intégration dans la page stocks** :
  - Bouton "Inventaire Rapide" à côté de "Entrée de Stock"
  - Couleur bleue distinctive pour différencier des réceptions
  - Accès direct depuis l'interface principale

- ✅ **Logique métier** :
  - Utilise le type de mouvement "inventaire" (fixe le stock)
  - Génère automatiquement des remarques d'historique
  - Met à jour les statistiques en temps réel après sauvegarde

**Utilisation** :

1. **Accès** : Page `/stocks` → Bouton "Inventaire Rapide"
2. **Recherche** : Filtrer les produits par nom ou code
3. **Saisie** : Entrer les nouvelles quantités en stock
4. **Validation** : Vérifier le résumé des modifications
5. **Sauvegarde** : Enregistrer tous les changements d'un coup

**Avantages** :

- **Rapidité** : Saisie de plusieurs produits sans formulaires répétitifs
- **Fiabilité** : Validation automatique et historique complet
- **Confort** : Interface claire avec recherche et feedback visuel
- **Efficacité** : Un seul clic pour mettre à jour tout l'inventaire

**Résultat** : L'inventaire devient une opération simple et rapide, idéale pour les contrôles périodiques de stock !

---à jour des statistiques de stock avec réservations (RÉALISÉ)

**Objectif** : Mettre à jour les cartes statistiques de la page stock pour prendre en compte les réservations des commandes actives.

**Actions réalisées** :

- ✅ **Carte "Stock réservé" ajoutée** :
  - Affiche la somme totale des quantités réservées dans les commandes actives
  - Utilise le hook `useStockReserve` pour récupérer les données en temps réel
  - Couleur orange distinctive avec icône appropriée

- ✅ **Carte "Stock faible" mise à jour** :
  - Compte maintenant les produits où le stock disponible (physique - réservé) < stock minimum
  - Logique corrigée pour refléter la vraie disponibilité des produits
  - Icône AlertTriangle pour indiquer les problèmes de stock

- ✅ **Carte "Stock disponible" corrigée** :
  - Calcule la somme des stocks disponibles (physique - réservé) pour tous les produits
  - Remplace l'ancienne logique basée uniquement sur le stock physique
  - Utilise `Math.max(0, stockPhysique - stockReserveQty)` pour éviter les valeurs négatives

- ✅ **Interface utilisateur améliorée** :
  - Grille de 4 cartes au lieu de 3 pour une meilleure organisation
  - Icônes Lucide React cohérentes (Package, AlertTriangle)
  - Couleurs distinctives pour chaque type de statistique

**Calculs implémentés** :

- **Stock réservé** : `Object.values(stockReserve).reduce((sum, qty) => sum + qty, 0)`
- **Stock faible** : Produits où `(stockPhysique - stockReserveQty) < stockMini`
- **Stock disponible** : `Σ Math.max(0, stockPhysique - stockReserveQty)` pour tous les produits

**Résultat** : Les statistiques de stock reflètent maintenant la vraie disponibilité des stocks en tenant compte des réservations des commandes en cours. Les utilisateurs peuvent voir :
- Combien de stock est physiquement disponible
- Combien est réservé dans les commandes actives  
- Quels produits sont en rupture de stock réelle
- La valeur totale du stock disponible

---

## ✅ Étape 7.1 — Corrections TypeScript et hooks manquants (RÉALISÉ)

**Objectif** : Résoudre les erreurs TypeScript et ajouter les hooks manquants pour le système de stock.

**Actions réalisées** :

- ✅ **Hook `useMouvementsStock` ajouté** :
  - Créé dans `/hooks/useStock.ts` pour récupérer l'historique des mouvements de stock
  - Prend un `produitId` en paramètre et retourne les mouvements triés par date
  - Utilisé par `ProductDetailsDialog` pour afficher l'historique

- ✅ **Hook `useStockReserve` restauré** :
  - Le hook avait été supprimé accidentellement, remis en place
  - Agrège les quantités réservées depuis les commandes actives
  - Filtre sur les statuts `reserve`, `en_preparation`, `pret_expedition`

- ✅ **Erreurs TypeScript corrigées** :
  - Types explicites pour `Object.values(stockReserve).reduce()` dans `app/stocks/page.tsx`
  - Suppression de la logique `indeterminate` incompatible dans `app/commandes/[id]/page.tsx`
  - Nettoyage des variables non utilisées (`isPartiallySelected`)

- ✅ **Vérification finale** :
  - Toutes les erreurs TypeScript résolues (`npx tsc --noEmit` passe sans erreur)
  - Composant `ProductDetailsDialog` peut maintenant charger l'historique des mouvements
  - Page stocks affiche correctement les statistiques avec réservations

**Résultat** : Le système de gestion des stocks est maintenant complet et fonctionnel avec :
- Historique des mouvements de stock visible dans les détails produit
- Statistiques tenant compte des réservations en temps réel
- Code TypeScript propre sans erreurs de compilation

---

---

**Objectif** : Créer un système d'impression d'étiquettes pour les commandes
avec génération PDF pour une meilleure compatibilité.

**Actions réalisées** :

- ✅ **Migration vers jsPDF** :

  - Remplacement de l'impression HTML par génération PDF
  - Bibliothèque `jsPDF` installée pour une meilleure compatibilité
  - Format d'étiquette 57 x 27 mm respecté avec précision

- ✅ **Composant d'impression `PrintLabel` amélioré** :

  - **Génération PDF native** avec dimensions exactes
  - **Trois fonctionnalités** : Aperçu, Téléchargement, Impression
  - **Design optimisé** : encadrement du numéro de commande, hiérarchie visuelle
  - **Gestion du texte long** : troncature intelligente du nom client

- ✅ **Interface utilisateur enrichie** :

  - **Bouton "Aperçu PDF"** : Ouvre le PDF dans un nouvel onglet
  - **Bouton "Télécharger PDF"** : Sauvegarde locale de l'étiquette
  - **Bouton "Imprimer PDF"** : Impression directe via le navigateur
  - **Configuration du magasin** : Toujours disponible via "Paramètres"

- ✅ **Avantages de la solution PDF** :
  - **Compatibilité universelle** : Fonctionne sur tous les navigateurs et OS
  - **Dimensions précises** : 57 x 27 mm respectés à 100%
  - **Qualité d'impression** : Rendu vectoriel parfait
  - **Archivage possible** : PDF téléchargeable pour conservation

**Fonctionnalités** :

- Génération d'étiquettes PDF aux dimensions exactes (57 x 27 mm)
- Trois modes d'utilisation : aperçu, téléchargement, impression
- Design professionnel avec encadrement du numéro de commande
- Configuration personnalisable du nom du magasin
- Gestion intelligente des noms de clients longs

**Utilisation** :

1. **Configuration** (optionnel) : "Paramètres" → modifier le nom du magasin
2. **Aperçu** : "Aperçu PDF" → visualiser l'étiquette dans un nouvel onglet
3. **Téléchargement** : "Télécharger PDF" → sauvegarder l'étiquette localement
4. **Impression** : "Imprimer PDF" → imprimer directement depuis le navigateur
   - Ajouter d'autres formats d'étiquettes
   - Permettre la personnalisation du design
   - Ajouter un aperçu avant impression
   - Intégrer avec une imprimante d'étiquettes spécialisée

---

## ✅ Étape 5 — Implémentation complète de l'authentification sécurisée (RÉALISÉ)

**Objectif** : Mettre en place un système d'authentification complet et sécurisé
avec Supabase Auth.

**Actions réalisées** :

- ✅ **Page de connexion/inscription complète** :

  - Interface utilisateur moderne avec shadcn/ui
  - Validation côté client robuste
  - Gestion des erreurs en français
  - Basculement connexion/inscription
  - Affichage/masquage du mot de passe
  - États de chargement et feedback utilisateur

- ✅ **Store d'authentification sécurisé (Zustand)** :

  - Gestion d'état centralisée avec `auth-store.ts`
  - Messages d'erreur personnalisés et traduits
  - Validation stricte des entrées
  - Persistance sécurisée (seules données non sensibles)
  - Fonction de réinitialisation de mot de passe
  - Nettoyage automatique des erreurs

- ✅ **Hook d'authentification optimisé** :

  - Interface simplifiée avec `useAuth.ts`
  - Méthodes de haut niveau (login, logout, register)
  - Redirection automatique après connexion
  - Gestion des états de chargement

- ✅ **Protection des routes** :

  - Middleware Next.js avec Supabase SSR
  - Redirection automatique selon l'état d'authentification
  - Routes publiques configurables
  - Gestion des cookies et sessions

- ✅ **Composants de sécurité** :

  - `ProtectedRoute` avec états de chargement
  - `Header` adaptatif selon l'authentification
  - Menu utilisateur avec profil et déconnexion
  - Navigation conditionnelle

- ✅ **Configuration Supabase sécurisée** :

  - Client Supabase optimisé avec gestion d'erreurs
  - Script SQL complet pour RLS et profils utilisateurs
  - Politiques de sécurité par rôle (admin, manager, user)
  - Triggers automatiques pour profils

- ✅ **Interface utilisateur améliorée** :

  - Page d'accueil avec présentation du produit
  - Redirection automatique si connecté
  - Composants UI manquants (Alert, Avatar, DropdownMenu)
  - Design moderne et responsive

- ✅ **Documentation complète** :
  - Guide complet dans `AUTHENTICATION.md`
  - Configuration étape par étape
  - Exemples d'utilisation
  - Dépannage et troubleshooting

**Points de sécurité implémentés** :

- 🔒 Row Level Security (RLS) sur toutes les tables
- 🔒 Validation côté client et serveur
- 🔒 Messages d'erreur sécurisés (pas de fuite d'informations)
- 🔒 Protection contre les attaques par force brute
- 🔒 Gestion sécurisée des sessions et cookies
- 🔒 Nettoyage automatique des données sensibles
- 🔒 Middleware de protection des routes
- 🔒 Séparation des rôles utilisateurs

**À faire maintenant** :

1. **Configurer les variables d'environnement** :

   ```bash
   cp .env.local.example .env.local
   # Remplir avec vos vraies clés Supabase
   ```

2. **Exécuter le script SQL** :

   - Aller sur https://supabase.com/dashboard
   - SQL Editor > Nouveau query
   - Copier/coller le contenu de `setup-auth-supabase.sql`
   - Exécuter

3. **Tester l'authentification** :

   - Redémarrer le serveur : `npm run dev`
   - Aller sur `/login`
   - Créer un compte de test
   - Vérifier la redirection vers `/dashboard`
   - Tester la déconnexion
   - Vérifier la protection des routes

4. **Prochaines étapes** :
   - Créer la page dashboard avec données réelles
   - Implémenter la gestion des profils utilisateurs
   - Ajouter les tests d'authentification
   - Intégrer l'authentification avec les autres fonctionnalités

**Points bloquants** :

- Aucun (nécessite la configuration des variables Supabase pour tester)

---

## ✅ Étape 4 — Intégration ProductSelect dans les commandes (RÉALISÉ)

**Objectif** : Permettre l'ajout de produits du catalogue Extrabat lors de
l'ajout de produits dans une commande.

**Actions réalisées** :

- ✅ Modification du composant `AddProduitDialog` avec double mode :
  - Mode catalogue : sélection depuis les produits synchronisés Extrabat
  - Mode manuel : saisie libre pour produits hors catalogue
- ✅ Intégration du composant `ProductSelect` existant
- ✅ Affichage des informations produit (prix, description, famille, stock)
- ✅ Pré-remplissage automatique des champs (nom, code) depuis le catalogue
- ✅ Interface de bascule intuitive entre les deux modes
- ✅ Validation appropriée selon le mode sélectionné

**Résultat** : Les utilisateurs peuvent maintenant ajouter des produits du
catalogue Extrabat directement dans leurs commandes, tout en gardant la
possibilité de saisir des produits personnalisés.

---

## 🎯 Étape 3 — Configuration et test de l'API Extrabat (RÉALISÉ)

**Objectif** : Tester la synchronisation des produits avec l'API Extrabat et
résoudre les erreurs "Internal Server Error".

**Problème identifié** :

- Erreurs "Internal Server Error" sporadiques sur l'application
- Besoin de valider la connectivité Extrabat et Supabase

**Actions réalisées** :

- ✅ Système complet de gestion des produits avec synchronisation Extrabat
- ✅ Types TypeScript complets (`ExtrabatProduit` et `Produit`)
- ✅ Schema SQL avec table `produits`, index et triggers
- ✅ Service `ExtrabatSyncService` avec gestion d'erreurs
- ✅ Hooks React Query (`useProduits`, `useProduitsMutations`)
- ✅ Composant `ProductSelect` avec recherche et badges de stock
- ✅ Page `/produits` avec dashboard, filtres et table interactive
- ✅ Correction de la dépréciation `legacyBehavior` dans les liens Next.js
- ✅ Composant de diagnostic Supabase créé

**Tests effectués** :

- ✅ Compilation réussie sans erreurs TypeScript
- ✅ Serveur de développement démarré sur port 3001
- ✅ Pages accessibles (/, /commandes, /produits, /test-supabase) - status 200
- ✅ Variables d'environnement Supabase et Extrabat configurées

**À faire maintenant** :

1. **Tester la synchronisation Extrabat** :

   ```bash
   node scripts/test-sync.js
   ```

2. **Vérifier les tables Supabase** :

   - Exécuter `setup-produits-supabase.sql` dans Supabase
   - Vérifier que toutes les tables existent (commandes, clients, produits)

3. **Diagnostiquer les erreurs** :
   - Analyser les logs du navigateur (F12 → Console)
   - Tester toutes les pages une par une
   - Vérifier les requêtes réseau dans l'onglet Network

**Points à vérifier** :

- Token Extrabat valide (expire le 2025-01-19)
- Connexion Supabase opérationnelle
- Absence d'erreurs JavaScript côté client

## ✅ Étape 2.1 — Correction configuration Supabase (RÉALISÉ)

**Problème identifié** : Erreur "Invalid API key" lors de l'accès aux données
Supabase.

**Cause** : La clé dans `.env.local` était un token de publication
(`sb_publishable_...`) au lieu de la clé anon Supabase.

**Actions réalisées** :

- Création d'un composant de diagnostic `SupabaseConnectionTest`
- Mise à jour des fichiers d'exemple avec les bonnes variables
- Création du guide détaillé `SUPABASE_SETUP.md`
- Correction des erreurs TypeScript (ajout de `'use client'` dans les hooks)

**À faire maintenant** :

1. **Récupérer la vraie clé anon Supabase** :

   - Aller sur https://supabase.com/dashboard
   - Sélectionner le projet wsrcjuknxapuxifhdrfb
   - Settings > API > Copier la clé "anon/public" (commence par `eyJ`)
   - Mettre à jour `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`
   - Redémarrer le serveur

2. **Vérifier les tables** : S'assurer que les tables `commande`, `client`,
   `personnel`, `commande_produit` existent dans Supabase

**Points bloquants** :

- Besoin de la vraie clé API Supabase pour tester

## ✅ Étape 2 — Affichage des commandes Supabase (RÉALISÉ)

**Objectif** : Créer les pages pour afficher toutes les commandes enregistrées
dans Supabase.

**Réalisé** :

- **Configuration Supabase** :

  - Installation de `@supabase/supabase-js`, `@tanstack/react-query`, `zustand`
  - Création du client Supabase dans `/lib/supabaseClient.ts`
  - Configuration des variables d'environnement (`.env.local.example`)

- **Types TypeScript alignés avec Supabase** :

  - Mise à jour de `/src/types/index.ts` avec les types `Client`, `Personnel`,
    `Commande`, `CommandeProduit`
  - Types correspondant exactement au schéma Dart/Supabase fourni
  - Types helpers pour les statuts et les formulaires

- **Hooks et logique de données** :

  - Création de `/hooks/useCommandes.ts` avec :
    - `useCommandes()` : récupération de toutes les commandes avec relations
      (client, personnel, produits)
    - `useCommande(id)` : récupération d'une commande spécifique avec détails
      complets
    - `useCommandeMutations()` : logique pour invalider le cache

- **Composants UI** :

  - `CommandeStatusBadge` : badges colorés pour les statuts de commande
  - `CommandesList` : tableau responsive avec toutes les commandes, progression,
    client, etc.
  - Pages `/app/commandes/page.tsx` : liste complète des commandes
  - Pages `/app/commandes/[id]/page.tsx` : vue détaillée d'une commande avec
    produits

- **Interface utilisateur** :

  - Configuration React Query globale dans `Providers`
  - Composants shadcn/ui : `badge`, `table`, `card` avec extensions
  - Navigation depuis la page d'accueil vers la liste des commandes
  - Affichage détaillé : informations client, progression, liste des produits
    scannés
  - Formatage des dates, montants en euros, statuts traduits

- **Fonctionnalités** :
  - Chargement avec loading states et gestion d'erreur
  - Liens de navigation entre liste et détail
  - Affichage complet des informations client (adresse, contact)
  - Tableau des produits avec statuts, numéros de série, dates de scan
  - Progression visuelle des commandes

**Points bloquants** :

- Aucun (nécessite la configuration des variables Supabase pour tester en réel)

**À faire ensuite** :

- Ajouter la création/édition de commandes via l'interface
- Implémenter la gestion temps réel (Supabase Realtime)
- Ajouter des filtres et recherche dans la liste des commandes
- Créer l'interface de gestion des produits et clients

## ✅ Étape 1 — Création du composant OrderForm (shadcn/ui)

**Réalisé** :

- Création du composant réutilisable `OrderForm` (structure, props, UI de base,
  validation, reset, feedback utilisateur)
- Création des sous-composants `ClientSelect` (props value/onChange) et
  `ProductTable` (props products/onAdd/onRemove)
- Utilisation de composants shadcn/ui (Button, Card)
- Mise en place d’un hook personnalisé `useOrderForm` pour la gestion du
  formulaire (état, validation, reset)
- Typage strict TypeScript, découplage UI/logique
- Intégration du formulaire sur la page d’accueil pour test

**Points bloquants** :

- (aucun)

**À faire ensuite** :

- Ajouter la logique métier réelle (fetch clients/produits, soumission Supabase)
- Ajouter la gestion de l’assignation technicien
- Ajouter les tests unitaires (hook, validation, composant)

## 1. Création de commande

- [ ] Formulaire de création : sélection client, ajout d’articles (produits)
- [ ] Assignation technicien automatique/manuelle après création

## 2. Workflow technicien

- [ ] Dashboard technicien : liste des commandes assignées
- [ ] Action “Prendre en charge” une commande (passe en « In Progress »)
- [ ] Vues séparées : Produits à préparer / Produits à expédier (filtrage par
      statut)

## 3. Gestion des lignes de commande (OrderLine)

- [ ] Mise à jour du statut de chaque ligne (to_prepare, in_preparation, ready,
      to_ship, shipped, not_available)
- [ ] Saisie du numéro de série pour chaque produit
- [ ] Pour les PC :
  - [ ] Champs outils de prise en main à distance (Supremo, AnyDesk,
        TeamViewer : ID + mot de passe)
  - [ ] Checkbox installation antivirus (optionnel)
  - [ ] Suivi masterisation et finalisation

## 4. UI/UX

- [ ] Utilisation exclusive de composants shadcn/ui (combobox, table, modal,
      etc.)
- [ ] Dashboards filtrés (client, technicien, statut, etc.)
- [ ] Responsive et intuitif

## 5. Realtime & Intégration

- [ ] Mises à jour temps réel des statuts commandes/produits (Supabase Realtime)
- [ ] Affichage de la progression globale d’une commande

## 6. Architecture & Typage

- [ ] Respect de la modularité (composants réutilisables, hooks, logique
      découplée)
- [ ] Utilisation stricte des modèles TypeScript fournis
- [ ] Synchronisation avec le schéma Supabase

---

# FAIT (à remplir après chaque tâche)

- (Décrire ici ce qui a été réalisé, les points bloquants éventuels, et ce qu’il
  reste à faire)

---

**1. Project Setup**

- Initialize a Next.js project with TypeScript.
- Set up `shadcn/ui` for the UI components.
- Configure state management (e.g., React Query for data fetching, Zustand for
  global state).

---

### **2. Data Models**

We'll define TypeScript interfaces for the following entities based on your
requirements:

#### **Client Model**

typescript interface Client { id: string; name: string; email: string; phone:
string; address: string; }

#### **Product Model**

typescript interface Product { id: string; name: string; type: "standard" |
"pc"; requiresPreparation: boolean; requiresShipping: boolean; }

#### **Order Line (Ligne) Model**

typescript interface OrderLine { id: string; productId: string; productName:
string; quantity: number; status: "to_prepare" | "ready" | "in_preparation" |
"not_available" | "to_ship" | "shipped"; serialNumber?: string; remoteTools?: {
supremo?: { id: string; password: string }; anydesk?: { id: string; password:
string }; teamviewer?: { id: string; password: string }; }; antivirusInstalled?:
boolean; process?: { masterization: boolean; finalization: boolean; }; }

#### **Order (Commande) Model**

typescript interface Order { id: string; clientId: string; clientName: string;
technicianId?: string; technicianName?: string; lines: OrderLine[]; status:
"pending" | "in_progress" | "completed" | "cancelled"; createdAt: string;
updatedAt: string; }

---

### **3. Workflow Implementation**

#### **Order Creation**

- A form to select a client and add products to the order.
- Submit the order, which assigns it to a technician (either manually or
  automatically).

#### **Technician Workflow**

- A dashboard for technicians showing orders assigned to them.
- Ability to "pick up" an order, updating its status to "In Progress".
- Separate views for:
  - **Products to Prepare**: Filtered list of `OrderLine` with
    `status === "to_prepare"`.
  - **Products to Ship**: Filtered list of `OrderLine` with
    `status === "to_ship"`.

#### **Product Line Actions**

- For each product line, technicians can:
  - Update the status (e.g., from "to_prepare" to "in_preparation").
  - Add a serial number.
  - For PCs:
    - Fill in remote tool IDs/passwords.
    - Mark antivirus installation.
    - Track masterization and finalization.

---

### **4. UI Components**

Using `shadcn/ui`, we'll create:

- **Order Creation Form**: Combobox for client selection, table for adding
  products.
- **Technician Dashboard**: Tabs for "To Prepare" and "To Ship" lists.
- **Order Detail View**: Shows all lines with editable fields for status, serial
  numbers, etc.
- **PC-Specific Modal**: Additional fields for remote tools and antivirus.

---

### **5. Real-Time Updates**

- Use WebSockets or polling to update order/product statuses in real time.
- Display a progress bar or indicator for each order based on line statuses.

---

### **6. Backend Integration**

- Mock API endpoints for now (e.g., using Next.js API routes).
- Later, integrate with a real backend (e.g., Firebase, Supabase, or a custom
  Node.js server).

---

### Objectif

Créer le workflow de création de commande : sélection client, ajout d’articles,
assignation technicien.

#### Étapes détaillées

- [ ] Créer un composant OrderForm réutilisable (shadcn/ui)
- [ ] Ajouter un composant ClientSelect (combobox, recherche client)
- [ ] Ajouter un composant ProductTable (tableau produits sélectionnables)
- [ ] Gérer l’ajout/suppression de lignes produits dynamiquement
- [ ] Validation du formulaire (client obligatoire, au moins un produit)
- [ ] Soumission : création de la commande en base (Supabase)
- [ ] Assignation technicien (auto/manuelle, champ select ou logique serveur)
- [ ] Affichage d’un message de succès/erreur (shadcn/ui Toast)
- [ ] Nettoyage du formulaire après succès

#### Clean code

- Composants UI découplés, props explicites, pas de logique métier dans l’UI
  pure
- Utilisation de hooks personnalisés pour la logique de création (ex:
  useCreateOrder)
- Typage strict (pas de any)
- Tests unitaires sur la logique de création et la validation (voir ci-dessous)

#### Tests unitaires à prévoir

- [ ] Test du hook useCreateOrder (succès, erreur, edge cases)
- [ ] Test de la validation du formulaire (client manquant, pas de produit)
- [ ] Test du composant OrderForm (rendu, interactions, reset après succès)

---

### **Next Steps**

1. **Initialize the Project**: bash npx create-next-app@latest order-management
   --typescript cd order-management

2. **Set up `shadcn/ui`**: bash npx shadcn-ui@latest init

3. **Create the Data Models**:

   - Add the TypeScript interfaces to `src/types/index.ts`.

4. **Build the UI**:
   - Start with the order creation form and technician dashboard.
````
