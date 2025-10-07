// Types métier synchronisés avec le schéma Supabase

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  extrabat_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Personnel {
  id: number;
  nom: string;
  prenom: string;
  avatar?: string;
  auto_created: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TypeCommande = 'normale' | 'migration_ouverture';

export interface Commande {
  id: string;
  client_id: number;
  numero_commande: string;
  date_commande?: string;
  date_limite_expedition?: string;
  type_commande: TypeCommande;
  date_migration?: string;
  date_expedition_previsionnelle?: string;
  acompte_verse: number;
  etat:
    | 'en_attente'
    | 'en_attente_dacompte'
    | 'en_cours'
    | 'pret_expedition'
    | 'expedie'
    | 'annule';
  progression: number;
  expedition_id?: number;
  remarque?: string;
  cmd_av?: string; // Commande antivirus optionnelle
  total_ttc: number;
  total_ht?: number;
  total_tva?: number;
  extrabat_id?: string;
  mode_reglement?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommandeProduit {
  id: string;
  commande_id: string;
  personnel_id: number;
  nom_produit: string;
  code_produit?: string;
  numero_serie?: string;
  quantite: number;
  statut:
    | 'scanne'
    | 'reserve'
    | 'en_preparation'
    | 'pret_expedition'
    | 'expedie'
    | 'livre';
  date_scan: string;
  remarque?: string;
  created_at?: string;
  updated_at?: string;
}

// Types pour les vues jointes (avec relations)
export interface CommandeWithDetails extends Commande {
  client?: Client;
  clients?: Client; // Supabase peut retourner un array
  personnel?: Personnel;
  commande_produits?: CommandeProduit[];
}

// Types pour les formulaires et UI
export interface CreateCommandeInput {
  client_id: number;
  numero_commande: string;
  date_commande?: string;
  date_limite_expedition?: string;
  type_commande?: TypeCommande;
  date_migration?: string;
  date_expedition_previsionnelle?: string;
  acompte_verse?: number;
  remarque?: string;
  cmd_av?: string; // Commande antivirus optionnelle
  total_ttc: number;
  total_ht?: number;
  total_tva?: number;
  mode_reglement?: string;
}

// Status helpers
export const CommandeTypes = {
  NORMALE: 'normale' as const,
  MIGRATION_OUVERTURE: 'migration_ouverture' as const,
};

export const CommandeStatus = {
  EN_ATTENTE: 'en_attente' as const,
  EN_ATTENTE_DACOMPTE: 'en_attente_dacompte' as const,
  EN_COURS: 'en_cours' as const,
  PRET_EXPEDITION: 'pret_expedition' as const,
  EXPEDIE: 'expedie' as const,
  ANNULE: 'annule' as const,
};

export const ProduitStatus = {
  SCANNE: 'scanne' as const,
  RESERVE: 'reserve' as const,
  EN_PREPARATION: 'en_preparation' as const,
  PRET_EXPEDITION: 'pret_expedition' as const,
  EXPEDIE: 'expedie' as const,
  LIVRE: 'livre' as const,
};

// Types pour les produits Extrabat
export interface ExtrabatProduit {
  id: number;
  code: string;
  codeBarre: string;
  libelle: string;
  description: string;
  prix: number;
  tenueStock: boolean;
  prixMini: string;
  deee: number;
  poids: string;
  emplacement: string;
  prixConseille: string;
  notes: string;
  commissionable: boolean;
  lastModification: string;
  precurseurExplosif: boolean;
  hasImage: boolean;
  hasImageGd: boolean;
  compteVente: {
    id: number;
    code: string;
    libelle: string;
    ordre: number;
  };
  compteAchat: {
    id: number;
    code: string;
    libelle: string;
    ordre: number;
  };
  tauxTva: {
    id: number;
    taux: string;
    ordre: number;
  };
  unite: {
    id: number;
    libelle: string;
  };
  sousFamille: {
    id: number;
    libelle: string;
  };
  articleType: {
    id: number;
    libelle: string;
  };
  famille: {
    id: number;
    libelle: string;
  };
}

// Interface pour les produits dans Supabase (version simplifiée et optimisée)
export interface Produit {
  id: number; // ID Extrabat
  code: string;
  code_barre?: string;
  libelle: string;
  description?: string;
  prix: number;
  prix_mini?: number;
  prix_conseille?: number;
  tenue_stock: boolean;
  stock_physique: number;
  stock_mini?: number;
  stock_maxi?: number;
  poids?: number;
  emplacement?: string;
  notes?: string;
  commissionable: boolean;
  taux_tva: number;
  unite_libelle?: string;
  sous_famille_id?: number;
  sous_famille_libelle?: string;
  famille_id?: number;
  famille_libelle?: string;
  article_type_id?: number;
  article_type_libelle?: string;
  has_image: boolean;
  has_image_gd: boolean;
  last_sync: string;
  archived: boolean;
  is_manuel: boolean;
  created_at?: string;
  updated_at?: string;
}

// Types pour la gestion des stocks
export type TypeMouvementStock = 'inventaire' | 'reception';

export interface MouvementStock {
  id: string;
  produit_id: number;
  type_mouvement: TypeMouvementStock;
  quantite_avant?: number;
  quantite_apres: number;
  quantite_mouvement: number;
  prix_unitaire?: number;
  fournisseur?: string;
  numero_facture?: string;
  date_entree?: string;
  remarques?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMouvementStockInput {
  produit_id: number;
  type_mouvement: TypeMouvementStock;
  quantite_mouvement: number;
  prix_unitaire?: number;
  fournisseur?: string;
  numero_facture?: string;
  date_entree?: string;
  remarques?: string;
}

export const MouvementStockTypes = {
  INVENTAIRE: 'inventaire' as const,
  RECEPTION: 'reception' as const,
};

// Types pour la gestion des expéditions multi-colis
export type ShipmentStatus = 'brouillon' | 'En préparation' | 'preparee' | 'verifiee' | 'expediee' | 'En transit' | 'livree';
export type ColisStatus = 'prepare' | 'expedie' | 'en_transit' | 'livre';

export interface Shipment {
  id: number;
  client: string;
  fa_bl_number: string;
  date_envoi: string;
  verificateur: string;  // Backward compatibility
  preparateur: string;   // Backward compatibility
  suivi_chronopost: string;
  observations?: string;
  statut: ShipmentStatus;
  created_at?: string;
  updated_at?: string;

  // Nouvelles colonnes étendues
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

// Interface pour les colis d'expédition
export interface ShipmentColis {
  id: string;
  shipment_id: number;
  numero_colis: number;
  numero_suivi_chronopost?: string;
  poids_grammes?: number;
  dimensions_cm?: string;
  statut_colis: ColisStatus;
  date_expedition?: string;
  date_livraison?: string;
  created_at?: string;
  updated_at?: string;
}

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

// Interface pour la création d'expédition multi-colis
export interface CreateShipmentInput {
  commande_id: string;
  client: string;
  numero_facture: string;
  preparateur_id: string;     // ID du personnel sélectionné
  verificateur_id?: string;   // ID du personnel sélectionné (optionnel)
  transporteur?: string;
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

// Interface pour la mise à jour d'un colis
export interface UpdateColisInput {
  numero_suivi_chronopost?: string;
  poids_grammes?: number;
  dimensions_cm?: string;
  statut_colis?: ColisStatus;
}

// Interface pour les détails d'expédition avec relations
export interface ShipmentWithDetails extends Shipment {
  commande?: Commande;
  shipment_produits?: ShipmentProduit[];
  colis?: ShipmentColis[];
  preparateur_info?: Personnel;
  verificateur_info?: Personnel;
  commande_produits?: CommandeProduit[]; // Pour faciliter l'accès aux produits de la commande
  client_info?: Client;
  clients?: Client[]; // Supabase peut retourner un array
  number_of_colis?: number; // Nombre de colis (agrégation)
  numero_facture?: string; // Pour filtrer sur la facture
}

// Interface pour la mise à jour du statut d'expédition
export interface UpdateShipmentStatusInput {
  statut: ShipmentStatus;
  date_preparation?: string;
  date_verification?: string;
  observations?: string;
}

// Constantes pour les statuts d'expédition
export const ShipmentStatusLabels = {
  brouillon: 'Brouillon',
  'En préparation': 'En préparation',
  preparee: 'Préparée',
  verifiee: 'Vérifiée',
  expediee: 'Expédiée',
  'En transit': 'En transit',
  livree: 'Livrée',
} as const;

export const ShipmentStatusColors = {
  brouillon: 'gray',
  'En préparation': 'blue',
  preparee: 'orange',
  verifiee: 'purple',
  expediee: 'green',
  'En transit': 'indigo',
  livree: 'emerald',
} as const;

// Constantes pour les statuts de colis
export const ColisStatusLabels = {
  prepare: 'Préparé',
  expedie: 'Expédié',
  en_transit: 'En transit',
  livre: 'Livré',
} as const;

export const ColisStatusColors = {
  prepare: 'orange',
  expedie: 'blue',
  en_transit: 'indigo',
  livre: 'green',
} as const;

// Types pour la gestion des paramètres de l'application
export type SettingCategory = 'general' | 'integrations';

export interface AppSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  is_encrypted: boolean;
  category: SettingCategory;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingInput {
  key: string;
  value: string;
}

export interface CreateSettingInput {
  key: string;
  value?: string;
  description?: string;
  is_encrypted?: boolean;
  category?: SettingCategory;
}

// Clés de paramètres prédéfinies
export const SettingKeys = {
  EXTRABAT_API_KEY: 'EXTRABAT_API_KEY',
  EXTRABAT_API_URL: 'EXTRABAT_API_URL',
  CHRONOPOST_API_KEY: 'CHRONOPOST_API_KEY',
  SHOP_NAME: 'SHOP_NAME',
  SHOP_ADDRESS: 'SHOP_ADDRESS',
  SHOP_PHONE: 'SHOP_PHONE',
  SHOP_EMAIL: 'SHOP_EMAIL',
} as const;
