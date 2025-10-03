-- Migration: Extensions pour le système de gestion des factures et expéditions multi-colis
-- Date: 2025-01-26
-- Description: Ajoute les colonnes nécessaires à la table shipments et crée les nouvelles tables

-- 1. Extensions de la table shipments existante
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS commande_id uuid REFERENCES commandes(id);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS numero_facture varchar;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_ht numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_ttc numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_tva numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS date_preparation timestamp with time zone;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS date_verification timestamp with time zone;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS transporteur varchar DEFAULT 'Chronopost';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS nombre_colis integer DEFAULT 1;

-- Ajout des références au personnel
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS preparateur_id integer REFERENCES personnel(id);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS verificateur_id integer REFERENCES personnel(id);

-- 2. Création de la table shipment_produits
DO $$
BEGIN
    -- Créer la table si elle n'existe pas
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shipment_produits') THEN
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
    ELSE
        -- Ajouter les colonnes manquantes si la table existe déjà
        ALTER TABLE shipment_produits ADD COLUMN IF NOT EXISTS numero_colis integer DEFAULT 1;
    END IF;
END $$;

-- 3. Création de la table shipment_colis pour la gestion multi-colis
CREATE TABLE IF NOT EXISTS shipment_colis (
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

-- 4. Création des indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_shipments_commande_id ON shipments(commande_id);
CREATE INDEX IF NOT EXISTS idx_shipments_preparateur_id ON shipments(preparateur_id);
CREATE INDEX IF NOT EXISTS idx_shipments_verificateur_id ON shipments(verificateur_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_shipment_id ON shipment_produits(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_commande_produit_id ON shipment_produits(commande_produit_id);
CREATE INDEX IF NOT EXISTS idx_shipment_colis_shipment_id ON shipment_colis(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_colis_suivi ON shipment_colis(numero_suivi_chronopost);

-- 5. Ajout des contraintes métier (après création des tables)
-- Contraintes pour shipments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_nombre_colis_positif') THEN
        ALTER TABLE shipments ADD CONSTRAINT chk_nombre_colis_positif
            CHECK (nombre_colis > 0);
    END IF;
END $$;

-- Contraintes pour shipment_produits
DO $$
BEGIN
    -- Vérifier que la table et les colonnes existent avant d'ajouter les contraintes
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'shipment_produits') THEN
        -- Contrainte quantité
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quantite_positive') THEN
            ALTER TABLE shipment_produits ADD CONSTRAINT chk_quantite_positive
                CHECK (quantite_expediee > 0);
        END IF;

        -- Contrainte numero_colis (seulement si la colonne existe)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'shipment_produits'
            AND column_name = 'numero_colis'
        ) AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_numero_colis_positif') THEN
            ALTER TABLE shipment_produits ADD CONSTRAINT chk_numero_colis_positif
                CHECK (numero_colis > 0);
        END IF;
    END IF;
END $$;

-- Contraintes pour shipment_colis
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_statut_colis') THEN
        ALTER TABLE shipment_colis ADD CONSTRAINT chk_statut_colis
            CHECK (statut_colis IN ('prepare', 'expedie', 'en_transit', 'livre'));
    END IF;
END $$;

-- 6. Fonction trigger pour maintenir la cohérence du nombre de colis
CREATE OR REPLACE FUNCTION update_shipment_colis_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour automatique du nombre de colis dans la table shipments
    UPDATE shipments
    SET nombre_colis = (
        SELECT COUNT(DISTINCT numero_colis)
        FROM shipment_colis
        WHERE shipment_id = COALESCE(NEW.shipment_id, OLD.shipment_id)
    )
    WHERE id = COALESCE(NEW.shipment_id, OLD.shipment_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Création du trigger
DROP TRIGGER IF EXISTS trigger_update_colis_count ON shipment_colis;
CREATE TRIGGER trigger_update_colis_count
    AFTER INSERT OR UPDATE OR DELETE ON shipment_colis
    FOR EACH ROW EXECUTE FUNCTION update_shipment_colis_count();

-- 7. Ajout des politiques RLS (Row Level Security)
ALTER TABLE shipment_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_colis ENABLE ROW LEVEL SECURITY;

-- Politique pour shipment_produits (même que shipments)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage shipment_produits' AND tablename = 'shipment_produits') THEN
        CREATE POLICY "Users can manage shipment_produits" ON shipment_produits
            FOR ALL USING (true);
    END IF;
END $$;

-- Politique pour shipment_colis (même que shipments)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage shipment_colis' AND tablename = 'shipment_colis') THEN
        CREATE POLICY "Users can manage shipment_colis" ON shipment_colis
            FOR ALL USING (true);
    END IF;
END $$;

-- 8. Commentaires pour documentation
COMMENT ON TABLE shipment_produits IS 'Table de liaison entre expéditions et produits de commande avec quantités expédiées';
COMMENT ON TABLE shipment_colis IS 'Gestion des colis individuels avec tracking Chronopost pour expéditions multi-colis';
COMMENT ON COLUMN shipment_colis.numero_suivi_chronopost IS 'Numéro de suivi unique Chronopost pour ce colis spécifique';
COMMENT ON COLUMN shipment_produits.numero_colis IS 'Référence au numéro de colis contenant ce produit';