-- Script pour vérifier et insérer les données de test dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier les tables existantes
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Vérifier les données clients
SELECT 'Clients dans la base:' as info, COUNT(*) as nombre FROM clients;
SELECT id, name, email FROM clients ORDER BY id;

-- 3. Vérifier les données commandes
SELECT 'Commandes dans la base:' as info, COUNT(*) as nombre FROM commandes;
SELECT numero_commande, client_id, etat, total_ttc FROM commandes ORDER BY created_at DESC;

-- 4. Vérifier les données produits
SELECT 'Produits dans la base:' as info, COUNT(*) as nombre FROM produits;
SELECT code, libelle, prix FROM produits ORDER BY libelle LIMIT 10;

-- 5. Vérifier les données commande_produits
SELECT 'Produits de commandes dans la base:' as info, COUNT(*) as nombre FROM commande_produits;
SELECT cp.nom_produit, c.numero_commande, cp.statut
FROM commande_produits cp
JOIN commandes c ON cp.commande_id = c.id
ORDER BY cp.created_at DESC
LIMIT 10;

-- 6. Insérer les données de test si elles n'existent pas
INSERT INTO clients (id, name, email, phone)
VALUES
  (1, 'Jean Dupont', 'jean.dupont@email.com', '0123456789'),
  (2, 'Marie Martin', 'marie.martin@email.com', '0987654321'),
  (3, 'Pierre Durand', 'pierre.durand@email.com', '0555123456')
ON CONFLICT (id) DO NOTHING;

INSERT INTO produits (id, code, libelle, prix, taux_tva, archived)
VALUES
  (7690280, '81RG0002FR17', 'PC PORTABLE I5 SSD 17"', 949.00, 20.00, false),
  (7690281, 'KB0001FR', 'Clavier AZERTY Français', 25.99, 20.00, false),
  (7690282, 'MS0001BT', 'Souris Bluetooth', 35.50, 20.00, false),
  (7690283, 'PRD-001', 'Produit A', 100.00, 20.00, false),
  (7690284, 'PRD-002', 'Produit B', 150.00, 20.00, false),
  (7690285, 'PRD-003', 'Produit C', 200.00, 20.00, false)
ON CONFLICT (id) DO NOTHING;

-- Insérer des commandes de test si elles n'existent pas
INSERT INTO commandes (
  id, client_id, numero_commande, etat, progression, total_ttc, total_ht, total_tva
) VALUES
  (gen_random_uuid(), 1, 'CMD-2025-001', 'en_attente', 10, 1200.00, 1000.00, 200.00),
  (gen_random_uuid(), 2, 'CMD-2025-002', 'en_cours', 45, 1500.00, 1250.00, 250.00),
  (gen_random_uuid(), 3, 'CMD-2025-003', 'pret_expedition', 85, 800.00, 666.67, 133.33)
ON CONFLICT (numero_commande) DO NOTHING;

-- 7. Vérification finale
SELECT
  'Résumé final:' as info,
  (SELECT COUNT(*) FROM clients) as clients,
  (SELECT COUNT(*) FROM commandes) as commandes,
  (SELECT COUNT(*) FROM produits) as produits,
  (SELECT COUNT(*) FROM commande_produits) as produits_commandes;

-- Afficher quelques exemples de données
SELECT 'Exemples de clients:' as info;
SELECT id, name FROM clients LIMIT 3;

SELECT 'Exemples de commandes:' as info;
SELECT numero_commande, etat, total_ttc FROM commandes LIMIT 3;

SELECT 'Exemples de produits:' as info;
SELECT code, libelle, prix FROM produits LIMIT 5;