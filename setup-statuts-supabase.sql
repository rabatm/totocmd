-- Script pour créer/mettre à jour les contraintes de statut dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer les anciennes contraintes s'elles existent
ALTER TABLE commandes DROP CONSTRAINT IF EXISTS commandes_etat_check;
ALTER TABLE commande_produits DROP CONSTRAINT IF EXISTS commande_produits_statut_check;

-- 2. Ajouter les nouvelles contraintes pour les statuts de commandes
ALTER TABLE commandes
ADD CONSTRAINT commandes_etat_check
CHECK (etat IN ('en_attente', 'en_cours', 'pret_expedition', 'expedie', 'annule'));

-- 3. Ajouter les nouvelles contraintes pour les statuts de produits
ALTER TABLE commande_produits
ADD CONSTRAINT commande_produits_statut_check
CHECK (statut IN ('scanne', 'en_preparation', 'pret_expedition', 'expedie', 'livre'));

-- 4. Mettre à jour les données existantes pour qu'elles respectent les nouvelles contraintes

-- Mise à jour des commandes (remplacer les anciens statuts par les nouveaux)
UPDATE commandes
SET etat = CASE
  WHEN etat = 'en_preparation' THEN 'en_cours'
  WHEN etat = 'prete' THEN 'pret_expedition'
  WHEN etat = 'annulee' THEN 'annule'
  ELSE etat
END
WHERE etat IN ('en_preparation', 'prete', 'annulee');

-- Mise à jour des produits (remplacer les anciens statuts par les nouveaux)
UPDATE commande_produits
SET statut = CASE
  WHEN statut = 'prepare' THEN 'en_preparation'
  WHEN statut = 'non_disponible' THEN 'livre'
  ELSE statut
END
WHERE statut IN ('prepare', 'non_disponible');

-- 5. Optionnel : Insérer quelques données de test pour vérifier les statuts

-- Données de test pour les clients (si pas déjà existants)
INSERT INTO clients (id, name, email, phone)
VALUES
  (1, 'Jean Dupont', 'jean.dupont@email.com', '0123456789'),
  (2, 'Marie Martin', 'marie.martin@email.com', '0987654321'),
  (3, 'Pierre Durand', 'pierre.durand@email.com', '0555123456')
ON CONFLICT (id) DO NOTHING;

-- Données de test pour le personnel (si pas déjà existants)
INSERT INTO personnel (id, nom, prenom, auto_created)
VALUES
  (1, 'Admin', 'System', true),
  (2, 'Préparateur', 'Test', true)
ON CONFLICT (id) DO NOTHING;

-- Données de test pour les commandes avec tous les statuts
INSERT INTO commandes (
  id,
  client_id,
  numero_commande,
  date_commande,
  date_limite_expedition,
  acompte_verse,
  etat,
  progression,
  total_ttc,
  total_ht,
  total_tva
) VALUES
  (
    gen_random_uuid(),
    1,
    'CMD-2025-001',
    '2025-01-10',
    '2025-01-20',
    500.00,
    'en_attente',
    10,
    1200.00,
    1000.00,
    200.00
  ),
  (
    gen_random_uuid(),
    2,
    'CMD-2025-002',
    '2025-01-08',
    '2025-01-18',
    750.00,
    'en_cours',
    45,
    1500.00,
    1250.00,
    250.00
  ),
  (
    gen_random_uuid(),
    3,
    'CMD-2025-003',
    '2025-01-05',
    '2025-01-15',
    200.00,
    'pret_expedition',
    85,
    800.00,
    666.67,
    133.33
  ),
  (
    gen_random_uuid(),
    1,
    'CMD-2025-004',
    '2025-01-01',
    '2025-01-11',
    1000.00,
    'expedie',
    100,
    2000.00,
    1666.67,
    333.33
  ),
  (
    gen_random_uuid(),
    2,
    'CMD-2025-005',
    '2024-12-20',
    '2024-12-30',
    0.00,
    'annule',
    0,
    600.00,
    500.00,
    100.00
  )
ON CONFLICT (numero_commande) DO NOTHING;

-- Récupérer les IDs des commandes créées pour les produits
DO $$
DECLARE
    cmd_id_1 UUID;
    cmd_id_2 UUID;
    cmd_id_3 UUID;
    cmd_id_4 UUID;
BEGIN
    -- Récupérer les IDs des commandes
    SELECT id INTO cmd_id_1 FROM commandes WHERE numero_commande = 'CMD-2025-001';
    SELECT id INTO cmd_id_2 FROM commandes WHERE numero_commande = 'CMD-2025-002';
    SELECT id INTO cmd_id_3 FROM commandes WHERE numero_commande = 'CMD-2025-003';
    SELECT id INTO cmd_id_4 FROM commandes WHERE numero_commande = 'CMD-2025-004';

    -- Insérer des produits de test avec différents statuts
    IF cmd_id_1 IS NOT NULL THEN
        INSERT INTO commande_produits (
            id, commande_id, personnel_id, nom_produit, code_produit,
            numero_serie, quantite, statut, date_scan
        ) VALUES
            (gen_random_uuid(), cmd_id_1, 1, 'Produit A', 'PRD-001', 'SN001', 2, 'scanne', NOW()),
            (gen_random_uuid(), cmd_id_1, 1, 'Produit B', 'PRD-002', 'SN002', 1, 'scanne', NOW());
    END IF;

    IF cmd_id_2 IS NOT NULL THEN
        INSERT INTO commande_produits (
            id, commande_id, personnel_id, nom_produit, code_produit,
            numero_serie, quantite, statut, date_scan
        ) VALUES
            (gen_random_uuid(), cmd_id_2, 2, 'Produit C', 'PRD-003', 'SN003', 1, 'en_preparation', NOW()),
            (gen_random_uuid(), cmd_id_2, 2, 'Produit D', 'PRD-004', 'SN004', 3, 'en_preparation', NOW());
    END IF;

    IF cmd_id_3 IS NOT NULL THEN
        INSERT INTO commande_produits (
            id, commande_id, personnel_id, nom_produit, code_produit,
            numero_serie, quantite, statut, date_scan
        ) VALUES
            (gen_random_uuid(), cmd_id_3, 2, 'Produit E', 'PRD-005', 'SN005', 1, 'pret_expedition', NOW()),
            (gen_random_uuid(), cmd_id_3, 2, 'Produit F', 'PRD-006', 'SN006', 2, 'pret_expedition', NOW());
    END IF;

    IF cmd_id_4 IS NOT NULL THEN
        INSERT INTO commande_produits (
            id, commande_id, personnel_id, nom_produit, code_produit,
            numero_serie, quantite, statut, date_scan
        ) VALUES
            (gen_random_uuid(), cmd_id_4, 1, 'Produit G', 'PRD-007', 'SN007', 1, 'expedie', NOW()),
            (gen_random_uuid(), cmd_id_4, 1, 'Produit H', 'PRD-008', 'SN008', 1, 'livre', NOW());
    END IF;
END $$;

-- 6. Vérification : Afficher tous les statuts possibles
SELECT 'Statuts de commandes disponibles:' as info;
SELECT DISTINCT etat FROM commandes ORDER BY etat;

SELECT 'Statuts de produits disponibles:' as info;
SELECT DISTINCT statut FROM commande_produits ORDER BY statut;

-- 7. Afficher un résumé des données
SELECT
    'Résumé des commandes' as info,
    etat,
    COUNT(*) as nombre
FROM commandes
GROUP BY etat
ORDER BY etat;

SELECT
    'Résumé des produits' as info,
    statut,
    COUNT(*) as nombre
FROM commande_produits
GROUP BY statut
ORDER BY statut;
