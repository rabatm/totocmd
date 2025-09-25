-- Script pour insérer des données de test avec des produits scannés
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. S'assurer que les produits existent
INSERT INTO produits (id, code, libelle, prix, taux_tva, tenue_stock, stock_physique, stock_mini)
VALUES
  (7690280, '81RG0002FR17', 'PC PORTABLE I5 SSD 17"', 949.00, 20.00, true, 10, 2),
  (7690281, 'KB0001FR', 'Clavier AZERTY Français', 25.99, 20.00, true, 50, 5),
  (7690282, 'MS0001BT', 'Souris Bluetooth', 35.50, 20.00, true, 30, 3)
ON CONFLICT (id) DO UPDATE SET
  stock_physique = EXCLUDED.stock_physique,
  stock_mini = EXCLUDED.stock_mini,
  tenue_stock = true;

-- 2. S'assurer que les clients existent
INSERT INTO clients (id, name, email)
VALUES
  (1, 'Jean Dupont', 'jean.dupont@email.com'),
  (2, 'Marie Martin', 'marie.martin@email.com')
ON CONFLICT (id) DO NOTHING;

-- 3. Créer des commandes de test avec différents états
INSERT INTO commandes (id, client_id, numero_commande, etat, total_ttc, total_ht, total_tva)
VALUES
  ('cmd-001', 1, 'CMD-TEST-001', 'en_attente', 1000.00, 833.33, 166.67),
  ('cmd-002', 2, 'CMD-TEST-002', 'en_cours', 1500.00, 1250.00, 250.00)
ON CONFLICT (numero_commande) DO NOTHING;

-- 4. Insérer des produits de commande avec différents statuts
-- Commande 1 (en_attente) : produits réservés et scannés
INSERT INTO commande_produits (commande_id, code_produit, nom_produit, quantite, prix_unitaire, statut)
VALUES
  ('cmd-001', '81RG0002FR17', 'PC PORTABLE I5 SSD 17"', 2, 949.00, 'reserve'),
  ('cmd-001', 'KB0001FR', 'Clavier AZERTY Français', 3, 25.99, 'scanne'),
  ('cmd-001', 'MS0001BT', 'Souris Bluetooth', 1, 35.50, 'scanne')
ON CONFLICT (commande_id, code_produit) DO UPDATE SET
  statut = EXCLUDED.statut,
  quantite = EXCLUDED.quantite;

-- Commande 2 (en_cours) : produits scannés
INSERT INTO commande_produits (commande_id, code_produit, nom_produit, quantite, prix_unitaire, statut)
VALUES
  ('cmd-002', '81RG0002FR17', 'PC PORTABLE I5 SSD 17"', 1, 949.00, 'scanne'),
  ('cmd-002', 'KB0001FR', 'Clavier AZERTY Français', 5, 25.99, 'scanne')
ON CONFLICT (commande_id, code_produit) DO UPDATE SET
  statut = EXCLUDED.statut,
  quantite = EXCLUDED.quantite;

-- 5. Vérification des données insérées
SELECT 'Vérification des données de test:' as info;

SELECT 'Produits avec stock:' as section;
SELECT code, libelle, stock_physique, stock_mini FROM produits WHERE tenue_stock = true;

SELECT 'Commandes de test:' as section;
SELECT numero_commande, etat FROM commandes WHERE numero_commande LIKE 'CMD-TEST-%';

SELECT 'Produits scannés dans les commandes:' as section;
SELECT
  c.numero_commande,
  cp.code_produit,
  cp.nom_produit,
  cp.quantite,
  cp.statut,
  c.etat as etat_commande
FROM commande_produits cp
JOIN commandes c ON cp.commande_id = c.id
WHERE cp.statut = 'scanne' AND c.etat IN ('en_attente', 'en_cours', 'pret_expedition')
ORDER BY c.numero_commande, cp.code_produit;

SELECT 'Résumé des stocks en commande clients:' as section;
SELECT
  code_produit,
  SUM(quantite) as quantite_totale
FROM commande_produits cp
JOIN commandes c ON cp.commande_id = c.id
WHERE cp.statut = 'scanne' AND c.etat IN ('en_attente', 'en_cours', 'pret_expedition')
GROUP BY code_produit
ORDER BY code_produit;