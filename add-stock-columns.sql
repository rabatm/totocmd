-- Migration SQL complète pour la gestion des stocks
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table mouvements_stock si elle n'existe pas
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

-- 2. Ajouter les colonnes de stock à la table produits
ALTER TABLE produits
ADD COLUMN IF NOT EXISTS stock_physique INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_mini INTEGER,
ADD COLUMN IF NOT EXISTS stock_maxi INTEGER,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_manuel BOOLEAN DEFAULT false;

-- 3. Ajouter les colonnes supplémentaires à la table mouvements_stock
ALTER TABLE mouvements_stock
ADD COLUMN IF NOT EXISTS fournisseur VARCHAR(255),
ADD COLUMN IF NOT EXISTS numero_facture VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_entree DATE;

-- 4. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_produit_id ON mouvements_stock(produit_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_date ON mouvements_stock(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_type ON mouvements_stock(type_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_fournisseur ON mouvements_stock(fournisseur);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_numero_facture ON mouvements_stock(numero_facture);
CREATE INDEX IF NOT EXISTS idx_mouvements_stock_date_entree ON mouvements_stock(date_entree);
CREATE INDEX IF NOT EXISTS idx_produits_stock_physique ON produits(stock_physique);
CREATE INDEX IF NOT EXISTS idx_produits_archived ON produits(archived);

-- 5. Ajouter des contraintes de validation
ALTER TABLE produits ADD CONSTRAINT check_stock_physique_non_negatif CHECK (stock_physique >= 0);
ALTER TABLE produits ADD CONSTRAINT check_stock_mini_non_negatif CHECK (stock_mini >= 0);
ALTER TABLE produits ADD CONSTRAINT check_stock_maxi_non_negatif CHECK (stock_maxi >= 0);

-- 6. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger pour auto-update du timestamp
DROP TRIGGER IF EXISTS update_mouvements_stock_updated_at ON mouvements_stock;
CREATE TRIGGER update_mouvements_stock_updated_at
    BEFORE UPDATE ON mouvements_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Mettre à jour les produits existants avec un stock physique de 0
UPDATE produits SET stock_physique = 0 WHERE stock_physique IS NULL;

-- 9. Commentaires pour la documentation
COMMENT ON TABLE mouvements_stock IS 'Historique des mouvements de stock (inventaire et réceptions)';
COMMENT ON COLUMN mouvements_stock.type_mouvement IS 'Type de mouvement: inventaire (fixe le stock) ou reception (ajoute au stock)';
COMMENT ON COLUMN mouvements_stock.quantite_avant IS 'Stock avant le mouvement (NULL pour inventaire initial)';
COMMENT ON COLUMN mouvements_stock.quantite_apres IS 'Stock après le mouvement';
COMMENT ON COLUMN mouvements_stock.quantite_mouvement IS 'Quantité du mouvement (positive ou négative)';
COMMENT ON COLUMN mouvements_stock.fournisseur IS 'Nom du fournisseur pour les réceptions';
COMMENT ON COLUMN mouvements_stock.numero_facture IS 'Numéro de facture fournisseur';
COMMENT ON COLUMN mouvements_stock.date_entree IS 'Date d''entrée en stock';
COMMENT ON COLUMN produits.stock_physique IS 'Stock physique actuel du produit';
COMMENT ON COLUMN produits.stock_mini IS 'Stock minimum recommandé';
COMMENT ON COLUMN produits.stock_maxi IS 'Stock maximum recommandé';
COMMENT ON COLUMN produits.archived IS 'Produit archivé (non visible dans les listes)';
COMMENT ON COLUMN produits.is_manuel IS 'Produit créé manuellement (non synchronisé avec Extrabat)';

-- 10. Afficher un résumé des modifications
SELECT
  'Migration des stocks terminée avec succès' as status,
  (SELECT COUNT(*) FROM produits) as total_produits,
  (SELECT COUNT(*) FROM mouvements_stock) as total_mouvements;