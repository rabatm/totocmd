-- Migration simplifiée : Création complète du système d'expéditions
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table shipments avec toutes les colonnes
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    commande_id uuid REFERENCES commandes(id),
    numero_facture varchar,
    total_ht numeric DEFAULT 0,
    total_ttc numeric DEFAULT 0,
    total_tva numeric DEFAULT 0,
    date_preparation timestamp with time zone,
    date_verification timestamp with time zone,
    transporteur varchar DEFAULT 'Chronopost',
    nombre_colis integer DEFAULT 1,
    preparateur_id integer REFERENCES personnel(id),
    verificateur_id integer REFERENCES personnel(id),
    statut VARCHAR(50) DEFAULT 'brouillon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table shipment_produits
CREATE TABLE IF NOT EXISTS shipment_produits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    commande_produit_id uuid NOT NULL REFERENCES commande_produits(id) ON DELETE CASCADE,
    quantite_expediee integer NOT NULL DEFAULT 1,
    prix_unitaire_ht numeric DEFAULT 0,
    prix_unitaire_ttc numeric DEFAULT 0,
    numero_colis integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(shipment_id, commande_produit_id)
);

-- 3. Créer la table shipment_colis
CREATE TABLE IF NOT EXISTS shipment_colis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    numero_colis integer NOT NULL,
    numero_suivi_chronopost varchar,
    poids_grammes integer,
    dimensions_cm varchar,
    statut_colis varchar DEFAULT 'prepare',
    date_expedition timestamp with time zone,
    date_livraison timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(shipment_id, numero_colis)
);

-- 4. Créer les index
CREATE INDEX IF NOT EXISTS idx_shipments_commande_id ON shipments(commande_id);
CREATE INDEX IF NOT EXISTS idx_shipments_preparateur_id ON shipments(preparateur_id);
CREATE INDEX IF NOT EXISTS idx_shipments_verificateur_id ON shipments(verificateur_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_shipment_id ON shipment_produits(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_commande_produit_id ON shipment_produits(commande_produit_id);
CREATE INDEX IF NOT EXISTS idx_shipment_colis_shipment_id ON shipment_colis(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_colis_suivi ON shipment_colis(numero_suivi_chronopost);

-- 5. Activer RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_colis ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques RLS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipments' AND policyname = 'Users can manage shipments') THEN
        CREATE POLICY "Users can manage shipments" ON shipments FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipment_produits' AND policyname = 'Users can manage shipment_produits') THEN
        CREATE POLICY "Users can manage shipment_produits" ON shipment_produits FOR ALL USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shipment_colis' AND policyname = 'Users can manage shipment_colis') THEN
        CREATE POLICY "Users can manage shipment_colis" ON shipment_colis FOR ALL USING (true);
    END IF;
END $$;

-- 7. Ajouter les contraintes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_nombre_colis_positif') THEN
        ALTER TABLE shipments ADD CONSTRAINT chk_nombre_colis_positif CHECK (nombre_colis > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quantite_positive') THEN
        ALTER TABLE shipment_produits ADD CONSTRAINT chk_quantite_positive CHECK (quantite_expediee > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_numero_colis_positif') THEN
        ALTER TABLE shipment_produits ADD CONSTRAINT chk_numero_colis_positif CHECK (numero_colis > 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_statut_colis') THEN
        ALTER TABLE shipment_colis ADD CONSTRAINT chk_statut_colis CHECK (statut_colis IN ('prepare', 'expedie', 'en_transit', 'livre'));
    END IF;
END $$;

-- 8. Commentaires
COMMENT ON TABLE shipments IS 'Table des expéditions avec gestion multi-colis';
COMMENT ON TABLE shipment_produits IS 'Table de liaison entre expéditions et produits de commande avec quantités expédiées';
COMMENT ON TABLE shipment_colis IS 'Gestion des colis individuels avec tracking Chronopost pour expéditions multi-colis';
COMMENT ON COLUMN shipment_colis.numero_suivi_chronopost IS 'Numéro de suivi unique Chronopost pour ce colis spécifique';
COMMENT ON COLUMN shipment_produits.numero_colis IS 'Référence au numéro de colis contenant ce produit';