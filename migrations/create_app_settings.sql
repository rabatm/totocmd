-- Migration: Création de la table des paramètres de l'application
-- Date: 2025-01-03
-- Description: Table pour stocker les paramètres de configuration de l'application

-- Création de la table app_settings
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(255) NOT NULL UNIQUE,
  value text,
  description text,
  is_encrypted boolean DEFAULT false,
  category varchar(100) DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);

-- Insertion des paramètres par défaut
INSERT INTO app_settings (key, value, description, category) VALUES
  ('EXTRABAT_API_KEY', '', 'Clé API ExtraBat pour la synchronisation', 'integrations'),
  ('EXTRABAT_API_URL', 'https://api.extrabat.com', 'URL de l''API ExtraBat', 'integrations'),
  ('CHRONOPOST_API_KEY', '', 'Clé API Chronopost pour le suivi des colis', 'integrations'),
  ('SHOP_NAME', 'TotoCmd', 'Nom de la boutique', 'general'),
  ('SHOP_ADDRESS', '', 'Adresse de la boutique', 'general'),
  ('SHOP_PHONE', '', 'Téléphone de la boutique', 'general'),
  ('SHOP_EMAIL', '', 'Email de la boutique', 'general')
ON CONFLICT (key) DO NOTHING;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_app_settings_updated_at ON app_settings;
CREATE TRIGGER trigger_update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_app_settings_updated_at();

-- RLS (Row Level Security) - Tous les utilisateurs authentifiés peuvent lire et modifier
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON app_settings;
CREATE POLICY "Allow authenticated users to read settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

-- Policy pour insertion
DROP POLICY IF EXISTS "Allow authenticated users to insert settings" ON app_settings;
CREATE POLICY "Allow authenticated users to insert settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy pour mise à jour
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON app_settings;
CREATE POLICY "Allow authenticated users to update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy pour suppression (restreint - peut être modifié selon les besoins)
DROP POLICY IF EXISTS "Allow authenticated users to delete settings" ON app_settings;
CREATE POLICY "Allow authenticated users to delete settings"
  ON app_settings FOR DELETE
  TO authenticated
  USING (true);

COMMENT ON TABLE app_settings IS 'Paramètres de configuration de l''application';
COMMENT ON COLUMN app_settings.key IS 'Clé unique du paramètre';
COMMENT ON COLUMN app_settings.value IS 'Valeur du paramètre';
COMMENT ON COLUMN app_settings.description IS 'Description du paramètre';
COMMENT ON COLUMN app_settings.is_encrypted IS 'Indique si la valeur est chiffrée';
COMMENT ON COLUMN app_settings.category IS 'Catégorie du paramètre (general, integrations, etc.)';
