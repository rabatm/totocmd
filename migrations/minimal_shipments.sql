-- Migration minimale : Tables d'expéditions pour TotoCmd
-- À exécuter dans Supabase SQL Editor

-- 1. Table shipments de base
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    commande_id uuid,
    statut VARCHAR(50) DEFAULT 'brouillon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table shipment_produits
CREATE TABLE IF NOT EXISTS shipment_produits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer REFERENCES shipments(id) ON DELETE CASCADE,
    commande_produit_id uuid,
    quantite_expediee integer DEFAULT 1,
    numero_colis integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Table shipment_colis
CREATE TABLE IF NOT EXISTS shipment_colis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id integer REFERENCES shipments(id) ON DELETE CASCADE,
    numero_colis integer,
    numero_suivi_chronopost varchar,
    statut_colis varchar DEFAULT 'prepare',
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Index essentiels
CREATE INDEX IF NOT EXISTS idx_shipments_commande_id ON shipments(commande_id);
CREATE INDEX IF NOT EXISTS idx_shipment_produits_shipment_id ON shipment_produits(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_colis_shipment_id ON shipment_colis(shipment_id);

-- 5. RLS de base
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_colis ENABLE ROW LEVEL SECURITY;

-- 6. Politiques simples (sans vérification d'existence)
DROP POLICY IF EXISTS "Users can manage shipments" ON shipments;
CREATE POLICY "Users can manage shipments" ON shipments FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage shipment_produits" ON shipment_produits;
CREATE POLICY "Users can manage shipment_produits" ON shipment_produits FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage shipment_colis" ON shipment_colis;
CREATE POLICY "Users can manage shipment_colis" ON shipment_colis FOR ALL USING (true);