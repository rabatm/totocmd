-- Script pour ajouter la colonne archived à la table produits
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne archived
ALTER TABLE produits ADD COLUMN archived BOOLEAN DEFAULT false;

-- 2. Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_produits_archived ON produits(archived);

-- 3. Mettre à jour la vue produits_actifs pour exclure les produits archivés
CREATE OR REPLACE VIEW produits_actifs AS
SELECT *
FROM produits
WHERE tenue_stock = true AND archived = false
ORDER BY libelle;

-- 4. Vérifier que la colonne a été ajoutée
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'produits'
  AND column_name = 'archived';

-- Afficher un message de confirmation
SELECT 'Colonne archived ajoutée avec succès !' as message;
