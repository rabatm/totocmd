-- Migration: Extension de la table shipments pour gestion des factures
-- Date: 2025-01-25
-- Description: Ajout des colonnes nécessaires au workflow de facturation

-- Étape 1: Ajout des nouvelles colonnes à la table shipments
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS commande_id uuid REFERENCES commandes(id);
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS numero_facture varchar;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_ht numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_ttc numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS total_tva numeric DEFAULT 0;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS date_preparation timestamp with time zone;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS date_verification timestamp with time zone;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS transporteur varchar DEFAULT 'Chronopost';

-- Étape 2: Création de la table de liaison shipment_produits
CREATE TABLE IF NOT EXISTS shipment_produits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    commande_produit_id uuid NOT NULL REFERENCES commande_produits(id) ON DELETE CASCADE,
    quantite_expediee integer NOT NULL DEFAULT 1,
    prix_unitaire_ht numeric DEFAULT 0,
    prix_unitaire_ttc numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(shipment_id, commande_produit_id)
);

-- Étape 3: Ajout des index pour performance
CREATE INDEX IF NOT EXISTS idx_shipments_commande_id ON shipments(commande_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_shipment_id ON shipment_produits(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_commande_produit_id ON shipment_produits(commande_produit_id);

-- Étape 4: Fonction de trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Étape 5: Trigger pour shipment_produits
CREATE TRIGGER update_shipment_produits_updated_at BEFORE UPDATE ON shipment_produits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Étape 6: Politique RLS pour shipment_produits
ALTER TABLE shipment_produits ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs authentifiés peuvent tout faire sur shipment_produits
CREATE POLICY "Users can manage shipment_produits" ON shipment_produits
FOR ALL USING (auth.role() = 'authenticated');

-- Étape 7: Mise à jour des données existantes (si nécessaire)
-- Génération de numéros de facture pour les shipments existants sans commande_id
UPDATE shipments
SET numero_facture = 'SHIP-' || LPAD(id::text, 6, '0')
WHERE numero_facture IS NULL;

-- Commentaires sur les colonnes pour documentation
COMMENT ON COLUMN shipments.commande_id IS 'ID de la commande associée à cette expédition';
COMMENT ON COLUMN shipments.numero_facture IS 'Numéro unique de la facture/expédition';
COMMENT ON COLUMN shipments.total_ht IS 'Total hors taxes de l''expédition';
COMMENT ON COLUMN shipments.total_ttc IS 'Total toutes taxes comprises de l''expédition';
COMMENT ON COLUMN shipments.total_tva IS 'Montant total de la TVA';
COMMENT ON COLUMN shipments.date_preparation IS 'Date et heure de fin de préparation';
COMMENT ON COLUMN shipments.date_verification IS 'Date et heure de vérification';
COMMENT ON COLUMN shipments.transporteur IS 'Nom du transporteur (Chronopost par défaut)';

COMMENT ON TABLE shipment_produits IS 'Liaison entre expéditions et produits de commande avec quantités';
COMMENT ON COLUMN shipment_produits.quantite_expediee IS 'Quantité du produit incluse dans cette expédition';
COMMENT ON COLUMN shipment_produits.prix_unitaire_ht IS 'Prix unitaire HT au moment de l''expédition';
COMMENT ON COLUMN shipment_produits.prix_unitaire_ttc IS 'Prix unitaire TTC au moment de l''expédition';