-- Migration SQL pour créer la table des mouvements de stock

-- Créer la table mouvements_stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produit_id INTEGER NOT NULL REFERENCES produits(id),
  type_mouvement VARCHAR(20) NOT NULL CHECK (type_mouvement IN ('inventaire', 'reception')),
  quantite_avant INTEGER,
  quantite_apres INTEGER NOT NULL,
  quantite_mouvement INTEGER NOT NULL,
  prix_unitaire DECIMAL(10,2),
  date_mouvement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  remarques TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les index pour les performances
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_produit_id ON mouvements_stock(produit_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_date ON mouvements_stock(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_type ON mouvements_stock(type_mouvement);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour auto-update du timestamp
CREATE TRIGGER update_mouvements_stock_updated_at
    BEFORE UPDATE ON mouvements_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des commentaires pour la documentation
COMMENT ON TABLE mouvements_stock IS 'Historique des mouvements de stock (inventaire et réceptions)';
COMMENT ON COLUMN mouvements_stock.type_mouvement IS 'Type de mouvement: inventaire (fixe le stock) ou reception (ajoute au stock)';
COMMENT ON COLUMN mouvements_stock.quantite_avant IS 'Stock avant le mouvement (NULL pour inventaire initial)';
COMMENT ON COLUMN mouvements_stock.quantite_apres IS 'Stock après le mouvement';
COMMENT ON COLUMN mouvements_stock.quantite_mouvement IS 'Quantité du mouvement (positive ou négative)';