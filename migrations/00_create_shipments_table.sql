-- Migration de base : Création de la table shipments
-- À exécuter en premier dans Supabase SQL Editor

-- 1. Créer la table shipments de base
CREATE TABLE IF NOT EXISTS shipments (
    id SERIAL PRIMARY KEY,
    statut VARCHAR(50) DEFAULT 'brouillon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS sur la table
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- 3. Créer une politique simple pour permettre l'accès
CREATE POLICY IF NOT EXISTS "Users can manage shipments" ON shipments
    FOR ALL USING (true);

-- 4. Commentaire
COMMENT ON TABLE shipments IS 'Table de base pour les expéditions - sera étendue par les migrations suivantes';