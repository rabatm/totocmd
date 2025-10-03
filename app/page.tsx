'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Database, Package, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Toto CMD
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Votre système de gestion des commandes moderne, sécurisé et intégré
            avec Supabase. Gérez vos commandes, clients et produits en toute
            simplicité.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Commencer maintenant</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Sécurisé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Authentification robuste avec Supabase et protection des données
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface réactive et temps réel pour une expérience optimale
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Database className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Intégré</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Synchronisation avec vos systèmes existants et API Extrabat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Aperçu des fonctionnalités */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Package className="h-6 w-6 mr-3 text-blue-600" />
                Gestion des commandes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-muted-foreground">
                  Suivi en temps réel
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-muted-foreground">
                  Statuts personnalisables
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-muted-foreground">
                  Notifications automatiques
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BarChart3 className="h-6 w-6 mr-3 text-green-600" />
                Tableau de bord
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-muted-foreground">
                  Statistiques détaillées
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-muted-foreground">
                  Rapports personnalisés
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-muted-foreground">
                  Analyse des performances
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
              <p className="text-muted-foreground mb-6">
                Connectez-vous à votre compte pour accéder à toutes les
                fonctionnalités
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Link href="/login">Accéder à l&apos;application</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
