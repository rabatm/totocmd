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
  stock_physique?: number;
  stock_mini?: number;
  // stock_physique: number; // Temporairement commenté car colonne manquante
  // stock_mini?: number; // Temporairement commenté car colonne manquante
  // stock_maxi?: number; // Temporairement commenté car colonne manquante
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
  archived?: boolean;
  // archived: boolean; // Temporairement commenté car colonne manquante
  // is_manuel: boolean; // Temporairement commenté car colonne manquante
  created_at?: string;
  updated_at?: string;
}
