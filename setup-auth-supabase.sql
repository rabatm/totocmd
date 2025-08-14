-- Configuration de l'authentification Supabase pour TotoCmd
-- Exécutez ce script dans l'éditeur SQL de votre dashboard Supabase

-- 1. Activer l'authentification par email
-- (Ceci est fait via le dashboard Supabase > Authentication > Settings)

-- 2. Configurer les politiques de sécurité Row Level Security (RLS)

-- Activer RLS sur toutes les tables principales
ALTER TABLE commande ENABLE ROW LEVEL SECURITY;
ALTER TABLE client ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE commande_produit ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;

-- Créer une table de profils utilisateurs liée à auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table profiles
-- Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Utilisateurs peuvent voir leur profil" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Utilisateurs peuvent modifier leur profil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Les admins peuvent voir tous les profils
CREATE POLICY "Admins peuvent voir tous les profils" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour les tables principales
-- Exemple : tous les utilisateurs authentifiés peuvent lire les données
CREATE POLICY "Utilisateurs authentifiés peuvent lire les commandes" ON public.commande
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les commandes" ON public.commande
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent lire les clients" ON public.client
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les clients" ON public.client
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent lire le personnel" ON public.personnel
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent lire les produits commande" ON public.commande_produit
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent modifier les produits commande" ON public.commande_produit
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Utilisateurs authentifiés peuvent lire les produits" ON public.produits
    FOR SELECT USING (auth.role() = 'authenticated');

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at sur profiles
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insertion d'un utilisateur admin par défaut (optionnel)
-- Vous devrez remplacer les valeurs ci-dessous
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'admin@totocmd.com',
--     crypt('votre_mot_de_passe_admin', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- Vue pour simplifier l'accès aux données utilisateur
CREATE OR REPLACE VIEW public.user_details AS
SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at,
    u.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id;

-- Accorder les permissions sur la vue
GRANT SELECT ON public.user_details TO authenticated;

-- Commentaires pour la documentation
COMMENT ON TABLE public.profiles IS 'Profils utilisateurs étendus liés à auth.users';
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur: admin, manager, ou user';
COMMENT ON VIEW public.user_details IS 'Vue combinée des profils et données d''authentification';
