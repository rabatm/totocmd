-- Migration: Rendre les colonnes verificateur et preparateur optionnelles
-- Date: 2025-01-27
-- Description: Permet la création d'expéditions sans vérificateur (ajouté plus tard)

-- Rendre la colonne verificateur (VARCHAR) optionnelle
ALTER TABLE shipments ALTER COLUMN verificateur DROP NOT NULL;

-- Rendre la colonne preparateur (VARCHAR) optionnelle aussi (pour cohérence)
ALTER TABLE shipments ALTER COLUMN preparateur DROP NOT NULL;

-- Les nouvelles colonnes preparateur_id et verificateur_id sont déjà optionnelles
-- Pas besoin de les modifier
