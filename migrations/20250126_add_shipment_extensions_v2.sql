-- Migration: Extensions pour le système de gestion des factures et expéditions multi-colis
-- Date: 2025-01-26
-- Version: 2 (Sécurisée et idempotente)
-- Description: Ajoute les colonnes nécessaires à la table shipments et crée les nouvelles tables

-- ====================================================================
-- PARTIE 1: Extensions de la table shipments existante
-- ====================================================================

ALTER TABLE shipments ADD COLUMN IF NOT EXISTS commande_id uuid;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS numero_facture varchar;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_ht numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_ttc numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_tva numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS date_preparation timestamp with time zone;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS date_verification timestamp with time zone;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS transporteur varchar DEFAULT 'Chronopost';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS nombre_colis integer DEFAULT 1;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS preparateur_id integer;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS verificateur_id integer;

-- Ajouter les contraintes de clés étrangères seulement si elles n'existent pas
DO $$
BEGIN
    -- Vérifier si commandes existe avant d'ajouter la FK
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'commandes') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipments_commande_id_fkey') THEN
            ALTER TABLE shipments ADD CONSTRAINT shipments_commande_id_fkey
                FOREIGN KEY (commande_id) REFERENCES commandes(id);
        END IF;
    END IF;

    -- Vérifier si personnel existe avant d'ajouter les FK
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'personnel') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipments_preparateur_id_fkey') THEN
            ALTER TABLE shipments ADD CONSTRAINT shipments_preparateur_id_fkey
                FOREIGN KEY (preparateur_id) REFERENCES personnel(id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipments_verificateur_id_fkey') THEN
            ALTER TABLE shipments ADD CONSTRAINT shipments_verificateur_id_fkey
                FOREIGN KEY (verificateur_id) REFERENCES personnel(id);
        END IF;
    END IF;
END $$;

-- ====================================================================
-- PARTIE 2: Création de la table shipment_produits
-- ====================================================================

-- Étape 1: Créer la table de base si elle n'existe pas
CREATE TABLE IF NOT EXISTS shipment_produits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer NOT NULL,
    commande_produit_id uuid NOT NULL,
    quantite_expediee integer NOT NULL DEFAULT 1,
    prix_unitaire_ht numeric DEFAULT 0,
    prix_unitaire_ttc numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Étape 2: Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE shipment_produits ADD COLUMN IF NOT EXISTS numero_colis integer DEFAULT 1;

-- Étape 3: Ajouter les contraintes et clés étrangères
DO $$
BEGIN
    -- Ajouter UNIQUE constraint si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'shipment_produits_shipment_id_commande_produit_id_key'
    ) THEN
        ALTER TABLE shipment_produits
            ADD CONSTRAINT shipment_produits_shipment_id_commande_produit_id_key
            UNIQUE(shipment_id, commande_produit_id);
    END IF;

    -- Ajouter FK vers shipments
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipment_produits_shipment_id_fkey') THEN
        ALTER TABLE shipment_produits
            ADD CONSTRAINT shipment_produits_shipment_id_fkey
            FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE;
    END IF;

    -- Ajouter FK vers commande_produits si la table existe
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'commande_produits') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipment_produits_commande_produit_id_fkey') THEN
            ALTER TABLE shipment_produits
                ADD CONSTRAINT shipment_produits_commande_produit_id_fkey
                FOREIGN KEY (commande_produit_id) REFERENCES commande_produits(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ====================================================================
-- PARTIE 3: Création de la table shipment_colis
-- ====================================================================

CREATE TABLE IF NOT EXISTS shipment_colis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer NOT NULL,
    numero_colis integer NOT NULL,
    numero_suivi_chronopost varchar,
    poids_grammes integer,
    dimensions_cm varchar,
    statut_colis varchar DEFAULT 'prepare',
    date_expedition timestamp with time zone,
    date_livraison timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ajouter les contraintes pour shipment_colis
DO $$
BEGIN
    -- UNIQUE constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'shipment_colis_shipment_id_numero_colis_key'
    ) THEN
        ALTER TABLE shipment_colis
            ADD CONSTRAINT shipment_colis_shipment_id_numero_colis_key
            UNIQUE(shipment_id, numero_colis);
    END IF;

    -- FK vers shipments
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shipment_colis_shipment_id_fkey') THEN
        ALTER TABLE shipment_colis
            ADD CONSTRAINT shipment_colis_shipment_id_fkey
            FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ====================================================================
-- PARTIE 4: Création des indexes pour optimiser les performances
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_shipments_commande_id ON shipments(commande_id);
CREATE INDEX IF NOT EXISTS idx_shipments_preparateur_id ON shipments(preparateur_id);
CREATE INDEX IF NOT EXISTS idx_shipments_verificateur_id ON shipments(verificateur_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_shipment_id ON shipment_produits(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_commande_produit_id ON shipment_produits(commande_produit_id);
CREATE INDEX IF NOT EXISTS idx_shipment_colis_shipment_id ON shipment_colis(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_colis_suivi ON shipment_colis(numero_suivi_chronopost);

-- ====================================================================
-- PARTIE 5: Ajout des contraintes métier
-- ====================================================================

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
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_quantite_positive') THEN
        ALTER TABLE shipment_produits ADD CONSTRAINT chk_quantite_positive
            CHECK (quantite_expediee > 0);
    END IF;

    -- Vérifier que la colonne numero_colis existe avant d'ajouter la contrainte
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'shipment_produits'
        AND column_name = 'numero_colis'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_numero_colis_positif') THEN
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

-- ====================================================================
-- PARTIE 6: Fonction trigger pour maintenir la cohérence du nombre de colis
-- ====================================================================

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

-- Créer ou remplacer le trigger
DROP TRIGGER IF EXISTS trigger_update_colis_count ON shipment_colis;
CREATE TRIGGER trigger_update_colis_count
    AFTER INSERT OR UPDATE OR DELETE ON shipment_colis
    FOR EACH ROW EXECUTE FUNCTION update_shipment_colis_count();

-- ====================================================================
-- PARTIE 7: Activation de Row Level Security (RLS)
-- ====================================================================

ALTER TABLE shipment_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_colis ENABLE ROW LEVEL SECURITY;

-- Politique pour shipment_produits
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can manage shipment_produits'
        AND tablename = 'shipment_produits'
    ) THEN
        CREATE POLICY "Users can manage shipment_produits" ON shipment_produits
            FOR ALL USING (true);
    END IF;
END $$;

-- Politique pour shipment_colis
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Users can manage shipment_colis'
        AND tablename = 'shipment_colis'
    ) THEN
        CREATE POLICY "Users can manage shipment_colis" ON shipment_colis
            FOR ALL USING (true);
    END IF;
END $$;

-- ====================================================================
-- PARTIE 8: Commentaires pour documentation
-- ====================================================================

COMMENT ON TABLE shipment_produits IS 'Table de liaison entre expéditions et produits de commande avec quantités expédiées';
COMMENT ON TABLE shipment_colis IS 'Gestion des colis individuels avec tracking Chronopost pour expéditions multi-colis';
COMMENT ON COLUMN shipment_colis.numero_suivi_chronopost IS 'Numéro de suivi unique Chronopost pour ce colis spécifique';
COMMENT ON COLUMN shipment_produits.numero_colis IS 'Référence au numéro de colis contenant ce produit';

-- ====================================================================
-- FIN DE LA MIGRATION
-- ====================================================================

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE 'Migration terminée avec succès!';
    RAISE NOTICE 'Tables créées/modifiées: shipments, shipment_produits, shipment_colis';
END $$;
