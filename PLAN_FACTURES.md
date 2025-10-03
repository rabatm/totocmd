# Plan de développement - Gestion des factures et expéditions

## Vue d'ensemble

Ce plan détaille l'implémentation d'un système de gestion des factures avec workflow de préparation, vérification et expédition dans TotoCmd. Le système s'appuie sur la table `shipments` existante pour éviter une refonte complète.

## Architecture proposée

### 1. Modifications de la base de données

#### 1.1 Extensions de la table `shipments`
```sql
-- Colonnes à ajouter à la table shipments existante
ALTER TABLE shipments ADD COLUMN commande_id uuid REFERENCES commandes(id);
ALTER TABLE shipments ADD COLUMN numero_facture varchar;
ALTER TABLE shipments ADD COLUMN total_ht numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN total_ttc numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN total_tva numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN date_preparation timestamp with time zone;
ALTER TABLE shipments ADD COLUMN date_verification timestamp with time zone;
ALTER TABLE shipments ADD COLUMN transporteur varchar DEFAULT 'Chronopost';
ALTER TABLE shipments ADD COLUMN nombre_colis integer DEFAULT 1;

-- Modification des colonnes personnel pour référencer la table personnel
ALTER TABLE shipments ADD COLUMN preparateur_id uuid REFERENCES personnel(id);
ALTER TABLE shipments ADD COLUMN verificateur_id uuid REFERENCES personnel(id);
-- Note: Garder les colonnes varchar existantes en backup lors de la migration
```

#### 1.2 Nouvelle table de liaison `shipment_produits`
```sql
CREATE TABLE shipment_produits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    commande_produit_id uuid NOT NULL REFERENCES commande_produits(id) ON DELETE CASCADE,
    quantite_expediee integer NOT NULL DEFAULT 1,
    prix_unitaire_ht numeric DEFAULT 0,
    prix_unitaire_ttc numeric DEFAULT 0,
    numero_colis integer DEFAULT 1,  -- Numéro du colis contenant ce produit
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(shipment_id, commande_produit_id)
);
```

#### 1.3 Nouvelle table `shipment_colis` pour la gestion multi-colis
```sql
CREATE TABLE shipment_colis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    numero_colis integer NOT NULL,  -- 1, 2, 3...
    numero_suivi_chronopost varchar,  -- Numéro de suivi Chronopost unique par colis
    poids_grammes integer,  -- Poids du colis en grammes
    dimensions_cm varchar,  -- Format "LxlxH" ex: "30x20x15"
    statut_colis varchar DEFAULT 'prepare',  -- prepare, expedie, en_transit, livre
    date_expedition timestamp with time zone,
    date_livraison timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(shipment_id, numero_colis)
);
```

#### 1.4 Nouveaux statuts pour les shipments
```sql
-- Extension des statuts existants
-- Existants: 'En préparation'
-- Nouveaux: 'brouillon', 'preparee', 'verifiee', 'expediee'
```

### 2. Types TypeScript

#### 2.1 Extensions des types existants
```typescript
// Extension du type Shipment existant
export interface ShipmentExtended {
  id: number;
  client: string;
  fa_bl_number: string;
  date_envoi: string;
  verificateur: string;  // Backward compatibility
  preparateur: string;   // Backward compatibility
  suivi_chronopost: string;
  observations?: string;
  statut: 'brouillon' | 'En préparation' | 'preparee' | 'verifiee' | 'expediee' | 'En transit' | 'livrée';
  created_at?: string;
  updated_at?: string;

  // Nouvelles propriétés
  commande_id?: string;
  numero_facture?: string;
  total_ht: number;
  total_ttc: number;
  total_tva: number;
  date_preparation?: string;
  date_verification?: string;
  transporteur?: string;
  nombre_colis: number;

  // Nouvelles références personnel
  preparateur_id?: string;
  verificateur_id?: string;

  // Relations
  colis?: ShipmentColis[];
  preparateur_info?: Personnel;  // Relation avec table personnel
  verificateur_info?: Personnel; // Relation avec table personnel
}

// Nouvelle interface pour les colis d'expédition
export interface ShipmentColis {
  id: string;
  shipment_id: number;
  numero_colis: number;
  numero_suivi_chronopost?: string;
  poids_grammes?: number;
  dimensions_cm?: string;
  statut_colis: 'prepare' | 'expedie' | 'en_transit' | 'livre';
  date_expedition?: string;
  date_livraison?: string;
  created_at?: string;
  updated_at?: string;
}

// Nouvelle interface pour les produits d'expédition
export interface ShipmentProduit {
  id: string;
  shipment_id: number;
  commande_produit_id: string;
  quantite_expediee: number;
  prix_unitaire_ht: number;
  prix_unitaire_ttc: number;
  numero_colis: number;  // Référence au colis contenant ce produit
  created_at?: string;
  updated_at?: string;

  // Relations
  commande_produit?: CommandeProduit;
}

// Interface pour la création d'expédition
export interface CreateShipmentInput {
  commande_id: string;
  client: string;
  numero_facture: string;
  preparateur_id: string;     // ID du personnel sélectionné
  verificateur_id?: string;   // ID du personnel sélectionné (optionnel au début)
  nombre_colis: number;
  colis: {
    numero_colis: number;
    poids_grammes?: number;
    dimensions_cm?: string;
    produits: {
      commande_produit_id: string;
      quantite_expediee: number;
      prix_unitaire_ht: number;
      prix_unitaire_ttc: number;
    }[];
  }[];
}

// Interface pour l'assignation de personnel
export interface PersonnelAssignment {
  preparateur_id?: string;
  verificateur_id?: string;
  date_assignation?: string;
}
```

### 3. Workflow détaillé

#### Phase 1: Création de l'expédition
1. **Déclencheur**: Bouton "Créer expédition" depuis une commande
2. **Interface**:
   - **Nouvelle**: Sélection personnel avec interface double-clic
     - Liste personnel à gauche (depuis table `personnel`)
     - 1er clic → Assigne comme préparateur (passe à droite)
     - 2ème clic → Assigne comme vérificateur (passe à droite)
   - Sélection des produits à expédier avec quantités
   - Répartition dans les colis
3. **Action**: Création d'un shipment avec statut "brouillon"
4. **Base**: Insertion dans `shipments`, `shipment_produits` et `shipment_colis`

#### Phase 2: Préparation
1. **Assignation**: Déjà assigné lors de la création (preparateur_id)
2. **Interface**: Scanner/interface de préparation
3. **Actions**:
   - Scan des produits un par un
   - Validation des quantités
   - Mise à jour du statut → "preparee"
   - Timestamp `date_preparation`

#### Phase 3: Vérification
1. **Assignation**: Déjà assigné lors de la création (verificateur_id) - validation que différent du préparateur
2. **Interface**: Interface de contrôle qualité
3. **Actions**:
   - Vérification visuelle/scan de contrôle
   - Validation ou retour en préparation
   - Mise à jour du statut → "verifiee"
   - Timestamp `date_verification`

#### Phase 4: Expédition
1. **Interface**: Saisie des informations d'expédition par colis
2. **Actions**:
   - **Par colis**: Saisie numéro de suivi Chronopost unique
   - **Par colis**: Saisie poids et dimensions
   - **Par colis**: Impression étiquette d'expédition individuelle
   - **Global**: Choix transporteur (par défaut Chronopost)
   - **Global**: Mise à jour du statut expédition → "expediee"
   - **Par colis**: Mise à jour du statut colis → "expedie"
   - Mise à jour des `commande_produits` concernés → "expedie"

## 4. Structure des composants UI

### 4.1 Pages principales
```
app/
├── shipments/                    # Page liste des expéditions
│   ├── page.tsx
│   ├── [id]/
│   │   ├── page.tsx             # Détail expédition
│   │   ├── preparation/
│   │   │   └── page.tsx         # Interface préparation
│   │   ├── verification/
│   │   │   └── page.tsx         # Interface vérification
│   │   └── expedition/
│   │       └── page.tsx         # Interface expédition
│   └── create/
│       └── [commandeId]/
│           └── page.tsx         # Création depuis commande
```

### 4.2 Composants spécialisés
```
components/
├── shipments/
│   ├── ShipmentCard.tsx         # Carte résumé expédition
│   ├── ShipmentList.tsx         # Liste avec filtres
│   ├── CreateShipmentDialog.tsx # Dialog création expédition
│   ├── PersonnelSelector.tsx    # NOUVEAU: Interface double-clic personnel
│   ├── PreparationInterface.tsx # Interface scan préparation
│   ├── VerificationInterface.tsx # Interface vérification
│   ├── ExpeditionInterface.tsx  # Saisie infos expédition
│   ├── ColisManagement.tsx      # Gestion des colis (ajout/suppression)
│   ├── ColisCard.tsx           # Carte individuelle d'un colis
│   ├── SuiviChronopost.tsx     # Composant suivi Chronopost
│   └── ShipmentStatusBadge.tsx  # Badge statut expédition
```

### 4.3 Intégrations pages existantes

#### Page commande (`/commandes/[id]`)
- **Nouvelle section "Expéditions"** sous les produits
- **Bouton "Créer expédition"** si produits éligibles
- **Liste des expéditions** associées avec statuts
- **Filtrage des produits** par statut d'expédition

#### Dashboard (`/dashboard`)
- **Widget "Expéditions en attente"** avec compteurs par statut
- **Alertes** pour expéditions en retard
- **Statistiques** préparation/vérification/expédition

## 5. API et hooks

### 5.1 Routes API
```
app/api/
├── shipments/
│   ├── route.ts                 # GET /api/shipments (liste avec filtres)
│   │                           # POST /api/shipments (création)
│   ├── [id]/
│   │   ├── route.ts            # GET/PUT/DELETE /api/shipments/[id]
│   │   ├── produits/
│   │   │   └── route.ts        # GET/POST produits d'expédition
│   │   ├── colis/
│   │   │   ├── route.ts        # GET/POST colis d'expédition
│   │   │   └── [colisId]/
│   │   │       ├── route.ts    # PUT colis (suivi, poids, dimensions)
│   │   │       └── suivi/
│   │   │           └── route.ts # PUT numéro de suivi Chronopost
│   │   ├── preparation/
│   │   │   └── route.ts        # PUT démarrer/terminer préparation
│   │   ├── verification/
│   │   │   └── route.ts        # PUT démarrer/terminer vérification
│   │   └── expedition/
│   │       └── route.ts        # PUT finaliser expédition
│   └── stats/
│       └── route.ts            # GET statistiques expéditions
```

### 5.2 Hooks personnalisés
```typescript
// hooks/useShipments.ts - Gestion CRUD expéditions
export const useShipments = (filters?) => { ... }

// hooks/useShipmentMutations.ts - Mutations expéditions
export const useCreateShipment = () => { ... }
export const useUpdateShipmentStatus = () => { ... }

// hooks/useShipmentProduits.ts - Gestion produits expédition
export const useShipmentProduits = (shipmentId) => { ... }

// hooks/useShipmentColis.ts - Gestion colis expédition
export const useShipmentColis = (shipmentId) => { ... }
export const useColisMutations = () => { ... }

// hooks/useSuiviChronopost.ts - Gestion numéros de suivi
export const useSuiviChronopost = (colisId) => { ... }
export const useUpdateSuiviChronopost = () => { ... }

// hooks/usePreparation.ts - Interface préparation
export const usePreparation = (shipmentId) => { ... }

// hooks/useVerification.ts - Interface vérification
export const useVerification = (shipmentId) => { ... }

// hooks/useShipmentWorkflow.ts - Workflow complet
export const useShipmentWorkflow = (shipmentId) => { ... }

// hooks/usePersonnel.ts - NOUVEAU: Gestion du personnel
export const usePersonnel = () => { ... }
export const usePersonnelAssignment = () => { ... }
```

## 6. Ordre d'implémentation

### Phase 1: Foundation (1-2 jours)
1. **Migration base de données**
   - Ajout colonnes à `shipments`
   - Création table `shipment_produits`
   - **Nouvelle**: Création table `shipment_colis`
   - Mise à jour des types TypeScript

2. **API de base**
   - Routes CRUD pour shipments étendus
   - Routes pour shipment_produits
   - **Nouvelle**: Routes pour shipment_colis avec gestion suivi
   - Hooks de base et hooks colis

### Phase 2: Interface création (1-2 jours)
3. **Page création expédition**
   - Interface sélection produits depuis commande
   - **Nouvelle**: Répartition des produits dans les colis
   - **Nouvelle**: Gestion dynamique du nombre de colis
   - Calcul automatique des totaux
   - Validation et création

4. **Intégration page commande**
   - Section expéditions avec détail des colis
   - Bouton création
   - **Nouvelle**: Affichage des numéros de suivi par colis
   - Mise à jour en temps réel

### Phase 3: Workflow préparation (1-2 jours)
5. **Interface préparation**
   - Scanner produits
   - Validation quantités
   - Gestion erreurs/manquants

6. **Interface vérification**
   - Contrôle qualité
   - Validation finale
   - Retour possible en préparation

### Phase 4: Expédition et finition (1-2 jours)
7. **Interface expédition**
   - Saisie transporteur/suivi **par colis**
   - **Nouvelle**: Saisie poids et dimensions par colis
   - **Nouvelle**: Impression étiquettes individuelles par colis
   - Finalisation avec validation tous colis

8. **Composants de suivi**
   - **Nouveau**: Composant suivi Chronopost intégré
   - **Nouveau**: Interface de gestion des colis
   - Mise à jour automatique des statuts

9. **Dashboard et statistiques**
   - Widgets expéditions avec compteur colis
   - **Nouvelle**: Statistiques par colis et par transporteur
   - Alertes et notifications
   - Rapports étendus

## 7. Points d'attention

### 7.1 Migration données
- **Shipments existants**: Mapping vers nouveaux champs
- **Statuts**: Migration des statuts existants
- **Intégrité**: Vérification des contraintes FK

### 7.2 Permissions et sécurité
- **RLS Supabase**: Politiques pour shipments étendus
- **Rôles utilisateurs**: Préparateur vs Vérificateur
- **Audit trail**: Traçabilité des actions

### 7.3 Performance
- **Requêtes optimisées**: Jointures efficaces avec relations
- **Cache**: Mise en cache des listes fréquentes
- **Real-time**: Updates Supabase pour statuts

### 7.4 UX/UI
- **Mobile-first**: Interfaces préparation/vérification sur mobile
- **Scanner**: Intégration caméra pour codes-barres
- **Notifications**: Alertes temps réel pour changements de statut

## 8. Tests

### 8.1 Tests unitaires
- Validation des hooks
- Calculs de totaux
- Transitions de statuts

### 8.2 Tests d'intégration
- Workflow complet création → expédition
- Synchronisation avec commande_produits
- Intégrité des données

### 8.3 Tests utilisateurs
- Interface préparation en situation réelle
- Performance sur mobile
- Gestion des erreurs

## Conclusion

Ce plan s'appuie sur l'existant tout en ajoutant les fonctionnalités demandées. L'approche incrémentale permet une mise en production progressive et une validation continue avec les utilisateurs.

**Durée estimée**: 6-8 jours de développement (+1 jour pour la gestion multi-colis)
**Impact**: Faible sur l'existant, forte valeur ajoutée métier avec traçabilité complète

## 9. Fonctionnalités multi-colis ajoutées

### 9.1 Avantages de la gestion multi-colis
- **Traçabilité**: Chaque colis a son propre numéro de suivi Chronopost
- **Flexibilité**: Répartition libre des produits dans les colis
- **Logistique**: Gestion du poids et des dimensions par colis
- **Suivi**: Statut indépendant par colis (préparé, expédié, en transit, livré)

### 9.2 Cas d'usage
1. **Commande volumineuse**: Répartition en plusieurs colis selon le poids/volume
2. **Produits fragiles**: Séparation des produits fragiles dans des colis spéciaux
3. **Livraison échelonnée**: Expédition partielle avec colis différés
4. **Gestion des retours**: Traçabilité précise par colis en cas de problème

### 9.3 Interface utilisateur
- **Drag & drop** pour répartir les produits entre colis
- **Calculateur automatique** de poids total par colis
- **Validation** des dimensions maximales Chronopost
- **Génération QR code** par colis pour le picking

## 10. Interface de sélection du personnel

### 10.1 Composant PersonnelSelector
```typescript
interface PersonnelSelectorProps {
  onPreparateurSelect: (personnel: Personnel) => void;
  onVerificateurSelect: (personnel: Personnel) => void;
  selectedPreparateur?: Personnel;
  selectedVerificateur?: Personnel;
}
```

### 10.2 Layout et fonctionnement
```
┌─────────────────────┬─────────────────────┐
│   ÉQUIPE DISPONIBLE │   AFFECTATIONS      │
├─────────────────────┼─────────────────────┤
│ □ Jean Martin       │ ✓ Préparateur:      │
│ □ Marie Dupont      │   Jean Martin       │
│ □ Pierre Durand     │                     │
│ □ Sophie Bernard    │ ✓ Vérificateur:     │
│ □ Alex Moreau       │   Marie Dupont      │
└─────────────────────┴─────────────────────┘
```

### 10.3 Logique d'interaction
1. **Premier clic** sur un membre → Assigne comme **Préparateur**
2. **Deuxième clic** (même personne) → Assigne comme **Vérificateur**
3. **Validation** : Vérificateur ≠ Préparateur (règle métier)
4. **Visual feedback** : Couleurs différentes pour chaque rôle
5. **Drag & drop** optionnel pour réorganiser

### 10.4 Avantages
- **Rapidité** : Sélection en 2 clics maximum
- **Clarté visuelle** : Rôles distincts et bien identifiés
- **Validation automatique** : Impossible d'assigner la même personne aux 2 rôles
- **Données fiables** : Utilisation de la base Supabase `personnel`