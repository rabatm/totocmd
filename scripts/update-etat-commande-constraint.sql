-- Migration : Ajout du statut 'attente_accompte' à la contrainte commandes_etat_check
-- À exécuter dans Supabase SQL Editor ou via migration

ALTER TABLE commandes
DROP CONSTRAINT IF EXISTS commandes_etat_check;

ALTER TABLE commandes
ADD CONSTRAINT commandes_etat_check
CHECK (
  etat IN (
    'en_attente',
    'attente_accompte',
    'en_cours',
    'pret_expedition',
    'expedie',
    'annule'
  )
);
