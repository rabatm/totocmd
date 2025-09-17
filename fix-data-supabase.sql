-- Script de diagnostic et réparation des données Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier l'existence des tables
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Vérifier si les tables existent
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'clients'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'Table clients n''existe pas !';
    ELSE
        RAISE NOTICE 'Table clients existe';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'commandes'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'Table commandes n''existe pas !';
    ELSE
        RAISE NOTICE 'Table commandes existe';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'produits'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'Table produits n''existe pas !';
    ELSE
        RAISE NOTICE 'Table produits existe';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'commande_produits'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'Table commande_produits n''existe pas !';
    ELSE
        RAISE NOTICE 'Table commande_produits existe';
    END IF;
END $$;

-- 2. Créer les tables si elles n'existent pas
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  extrabat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id INTEGER REFERENCES clients(id),
  numero_commande TEXT NOT NULL UNIQUE,
  date_commande TIMESTAMPTZ,
  date_limite_expedition TIMESTAMPTZ,
  acompte_verse NUMERIC DEFAULT 0,
  etat TEXT DEFAULT 'en_attente',
  progression INTEGER DEFAULT 0,
  expedition_id INTEGER,
  remarque TEXT,
  total_ttc NUMERIC NOT NULL,
  total_ht NUMERIC,
  total_tva NUMERIC,
  extrabat_id TEXT,
  mode_reglement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produits (
  id BIGINT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  code_barre TEXT,
  libelle TEXT NOT NULL,
  description TEXT,
  prix NUMERIC NOT NULL DEFAULT 0,
  prix_mini NUMERIC,
  prix_conseille NUMERIC,
  tenue_stock BOOLEAN DEFAULT true,
  poids NUMERIC,
  emplacement TEXT,
  notes TEXT,
  commissionable BOOLEAN DEFAULT false,
  taux_tva NUMERIC NOT NULL DEFAULT 20.00,
  unite_libelle TEXT,
  sous_famille_id INTEGER,
  sous_famille_libelle TEXT,
  famille_id INTEGER,
  famille_libelle TEXT,
  article_type_id INTEGER,
  article_type_libelle TEXT,
  has_image BOOLEAN DEFAULT false,
  has_image_gd BOOLEAN DEFAULT false,
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commande_produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  personnel_id INTEGER,
  nom_produit TEXT NOT NULL,
  code_produit TEXT,
  numero_serie TEXT,
  quantite INTEGER DEFAULT 1,
  statut TEXT DEFAULT 'scanne',
  date_scan TIMESTAMPTZ DEFAULT NOW(),
  remarque TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insérer des données de test simples
INSERT INTO clients (id, name, email, phone) VALUES
  (1, 'Jean Dupont', 'jean.dupont@email.com', '0123456789'),
  (2, 'Marie Martin', 'marie.martin@email.com', '0987654321'),
  (3, 'Pierre Durand', 'pierre.durand@email.com', '0555123456')
ON CONFLICT (id) DO NOTHING;

INSERT INTO produits (id, code, libelle, prix, taux_tva, archived) VALUES
  (1001, 'PC001', 'Ordinateur Portable', 899.99, 20.00, false),
  (1002, 'KB001', 'Clavier USB', 29.99, 20.00, false),
  (1003, 'MS001', 'Souris Optique', 19.99, 20.00, false),
  (1004, 'SCR001', 'Écran 24"', 149.99, 20.00, false),
  (1005, 'PRN001', 'Imprimante Laser', 199.99, 20.00, false)
ON CONFLICT (id) DO NOTHING;

-- Insérer une commande de test
INSERT INTO commandes (id, client_id, numero_commande, etat, progression, total_ttc, total_ht, total_tva)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  1,
  'CMD-TEST-001',
  'en_attente',
  0,
  1149.97,
  958.31,
  191.66
)
ON CONFLICT (numero_commande) DO NOTHING;

-- Insérer des produits pour cette commande
INSERT INTO commande_produits (id, commande_id, personnel_id, nom_produit, code_produit, numero_serie, quantite, statut)
VALUES
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 1, 'Ordinateur Portable', 'PC001', 'SN-PC-001', 1, 'scanne'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 1, 'Clavier USB', 'KB001', 'SN-KB-001', 1, 'scanne'),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000', 1, 'Souris Optique', 'MS001', 'SN-MS-001', 1, 'scanne')
ON CONFLICT DO NOTHING;

-- 4. Vérification finale
SELECT
  'DONNÉES APRÈS INSERTION:' as info,
  (SELECT COUNT(*) FROM clients) as clients,
  (SELECT COUNT(*) FROM commandes) as commandes,
  (SELECT COUNT(*) FROM produits) as produits,
  (SELECT COUNT(*) FROM commande_produits) as produits_commandes;

-- Afficher les données
SELECT 'CLIENTS:' as section;
SELECT id, name FROM clients ORDER BY id;

SELECT 'COMMANDES:' as section;
SELECT numero_commande, etat, total_ttc FROM commandes ORDER BY created_at DESC;

SELECT 'PRODUITS:' as section;
SELECT code, libelle, prix FROM produits WHERE archived = false ORDER BY libelle;

SELECT 'PRODUITS DE COMMANDE:' as section;
SELECT cp.nom_produit, c.numero_commande, cp.statut
FROM commande_produits cp
JOIN commandes c ON cp.commande_id = c.id
ORDER BY cp.created_at DESC;