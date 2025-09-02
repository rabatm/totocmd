-- Correction : remplace 'attente_accompte' par 'en_attente_dacompte' dans la contrainte
ALTER TABLE commandes
DROP CONSTRAINT IF EXISTS commandes_etat_check;

ALTER TABLE commandes
ADD CONSTRAINT commandes_etat_check
CHECK (
  etat IN (
    'en_attente',
    'en_attente_dacompte',
    'en_cours',
    'pret_expedition',
    'expedie',
    'annule'
  )
);
