-- Migration SQL pour ajouter les champs de migration/ouverture à la table commandes

-- Étape 1: Ajouter la colonne type_commande
ALTER TABLE commandes ADD COLUMN type_commande VARCHAR(50) DEFAULT 'normale';

-- Étape 2: Ajouter la contrainte de vérification
ALTER TABLE commandes ADD CONSTRAINT check_type_commande CHECK (type_commande IN ('normale', 'migration_ouverture'));

-- Étape 3: Ajouter la colonne date_migration
ALTER TABLE commandes ADD COLUMN date_migration DATE;

-- Étape 4: Ajouter la colonne date_expedition_previsionnelle
ALTER TABLE commandes ADD COLUMN date_expedition_previsionnelle DATE;

-- Étape 5: Mettre à jour les enregistrements existants avec le type par défaut
UPDATE commandes SET type_commande = 'normale' WHERE type_commande IS NULL;