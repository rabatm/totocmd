-- Migration ultra-minimale : Tables d'expéditions sans références externes
-- À exécuter dans Supabase SQL Editor

-- 1. Table shipments ultra-simple
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    statut VARCHAR(50) DEFAULT 'brouillon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- 3. Politique simple
DROP POLICY IF EXISTS "Users can manage shipments" ON shipments;
CREATE POLICY "Users can manage shipments" ON shipments FOR ALL USING (true);