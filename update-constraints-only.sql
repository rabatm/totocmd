-- Script simple pour mettre à jour uniquement les contraintes de statut
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer les anciennes contraintes
ALTER TABLE commandes DROP CONSTRAINT IF EXISTS commandes_etat_check;
ALTER TABLE commande_produits DROP CONSTRAINT IF EXISTS commande_produits_statut_check;

-- 2. Ajouter les nouvelles contraintes pour les commandes
ALTER TABLE commandes
ADD CONSTRAINT commandes_etat_check
CHECK (etat IN ('en_attente', 'en_cours', 'pret_expedition', 'expedie', 'annule'));

-- 3. Ajouter les nouvelles contraintes pour les produits
ALTER TABLE commande_produits
ADD CONSTRAINT commande_produits_statut_check
CHECK (statut IN ('scanne', 'en_preparation', 'pret_expedition', 'expedie', 'livre'));

-- 4. Mettre à jour les données existantes si nécessaire
UPDATE commandes
SET etat = CASE
  WHEN etat = 'en_preparation' THEN 'en_cours'
  WHEN etat = 'prete' THEN 'pret_expedition'
  WHEN etat = 'annulee' THEN 'annule'
  ELSE etat
END
WHERE etat IN ('en_preparation', 'prete', 'annulee');

UPDATE commande_produits
SET statut = CASE
  WHEN statut = 'prepare' THEN 'en_preparation'
  WHEN statut = 'non_disponible' THEN 'livre'
  ELSE statut
END
WHERE statut IN ('prepare', 'non_disponible');

-- Vérification
SELECT 'Contraintes mises à jour avec succès!' as message;
