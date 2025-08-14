-- Script SQL pour créer la table produits dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table produits
CREATE TABLE IF NOT EXISTS produits (
  id BIGINT PRIMARY KEY, -- ID venant d'Extrabat
  code VARCHAR(50) NOT NULL UNIQUE,
  code_barre VARCHAR(100),
  libelle VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10,4) NOT NULL DEFAULT 0,
  prix_mini DECIMAL(10,4),
  prix_conseille DECIMAL(10,4),
  tenue_stock BOOLEAN DEFAULT true,
  poids DECIMAL(8,2),
  emplacement VARCHAR(100),
  notes TEXT,
  commissionable BOOLEAN DEFAULT false,
  taux_tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  unite_libelle VARCHAR(50),
  sous_famille_id INTEGER,
  sous_famille_libelle VARCHAR(255),
  famille_id INTEGER,
  famille_libelle VARCHAR(255),
  article_type_id INTEGER,
  article_type_libelle VARCHAR(255),
  has_image BOOLEAN DEFAULT false,
  has_image_gd BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_produits_code ON produits(code);
CREATE INDEX IF NOT EXISTS idx_produits_libelle ON produits(libelle);
CREATE INDEX IF NOT EXISTS idx_produits_famille ON produits(famille_id);
CREATE INDEX IF NOT EXISTS idx_produits_sous_famille ON produits(sous_famille_id);
CREATE INDEX IF NOT EXISTS idx_produits_prix ON produits(prix);
CREATE INDEX IF NOT EXISTS idx_produits_tenue_stock ON produits(tenue_stock);
CREATE INDEX IF NOT EXISTS idx_produits_last_sync ON produits(last_sync);

-- 3. Créer une fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_produits_updated_at ON produits;
CREATE TRIGGER update_produits_updated_at
    BEFORE UPDATE ON produits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Ajouter une contrainte pour s'assurer que le prix est positif
ALTER TABLE produits ADD CONSTRAINT check_prix_positif CHECK (prix >= 0);

-- 6. Créer une vue pour les produits actifs (en stock)
CREATE OR REPLACE VIEW produits_actifs AS
SELECT *
FROM produits
WHERE tenue_stock = true
ORDER BY libelle;

-- 7. Créer une table pour le log de synchronisation
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'produits', 'clients', etc.
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'running'
  records_processed INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_errors INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER
);

-- 8. Index pour les logs de sync
CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at);

-- 9. Politique RLS (Row Level Security) - optionnel selon vos besoins
-- ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Tous les utilisateurs peuvent lire les produits" ON produits FOR SELECT USING (true);

-- 10. Insérer quelques données de test (optionnel)
INSERT INTO produits (
  id, code, libelle, description, prix, taux_tva, unite_libelle,
  famille_libelle, sous_famille_libelle, has_image, last_sync
) VALUES
  (7690280, '81RG0002FR17', 'PC PORTABLE I5 SSD 17"', '17.3"- Core i5 10210U <br>8 Go RAM - W11 Pro<br>128 Go SSD + 1 To HDD', 949.00, 20.00, 'Uni', 'famille_399', 'PC portables', true, NOW()),
  (7690281, 'KB0001FR', 'Clavier AZERTY Français', 'Clavier filaire USB standard', 25.99, 20.00, 'Uni', 'Périphériques', 'Claviers', false, NOW()),
  (7690282, 'MS0001BT', 'Souris Bluetooth', 'Souris sans fil Bluetooth ergonomique', 35.50, 20.00, 'Uni', 'Périphériques', 'Souris', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- Afficher un résumé
SELECT
  'Produits créés' as info,
  COUNT(*) as nombre
FROM produits;

SELECT
  'Structure de la table créée avec succès !' as message;
