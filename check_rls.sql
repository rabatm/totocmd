
-- Vérifier les politiques RLS sur shipments
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'shipments';

-- Vérifier les politiques sur shipments
SELECT * FROM pg_policies WHERE tablename = 'shipments';

-- Vérifier les politiques sur shipment_produits  
SELECT * FROM pg_policies WHERE tablename = 'shipment_produits';

