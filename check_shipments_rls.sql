-- Script pour vérifier les politiques RLS et tester les tables shipments

-- 1. Vérifier si RLS est activé sur shipments
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'shipments' AND schemaname = 'public';

-- 2. Lister toutes les politiques RLS sur shipments
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'shipments';

-- 3. Vérifier si RLS est activé sur shipment_produits
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'shipment_produits' AND schemaname = 'public';

-- 4. Lister toutes les politiques RLS sur shipment_produits
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'shipment_produits';

-- 5. Vérifier la structure des tables
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('shipments', 'shipment_produits') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 6. Tester une insertion simple (remplacer les UUIDs par des valeurs réelles)
-- SELECT id FROM commandes LIMIT 1; -- Pour obtenir un commande_id valide
-- SELECT id FROM commande_produits LIMIT 1; -- Pour obtenir un commande_produit_id valide

-- 7. Si RLS bloque, désactiver temporairement pour tester
-- ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE shipment_produits DISABLE ROW LEVEL SECURITY;
