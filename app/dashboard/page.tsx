'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  TrendingDown,
  TrendingUp,
  Users,
  Plus,
  List,
  Settings,
  TestTube,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bonjour {user?.email} ! Vue d&apos;ensemble de votre activité
          </p>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Chiffre d&apos;affaires
                  </p>
                  <p className="text-2xl font-bold">€45,231</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% ce mois
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Commandes totales
                  </p>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8 cette semaine
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Clients actifs
                  </p>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -2% ce mois
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Taux de livraison
                  </p>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2% ce mois
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/commandes/create" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle commande
                </Button>
              </Link>

              <Link href="/commandes" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <List className="h-4 w-4 mr-2" />
                  Voir toutes les commandes
                </Button>
              </Link>

              <Link href="/clients" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Gérer les clients
                </Button>
              </Link>

              <Link href="/produits" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Catalogue produits
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Commandes récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CMD-2025-012</p>
                    <p className="text-sm text-muted-foreground">Jean Dupont</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">En cours</Badge>
                    <p className="text-sm text-muted-foreground mt-1">€1,200</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CMD-2025-011</p>
                    <p className="text-sm text-muted-foreground">
                      Marie Martin
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Expédiée</Badge>
                    <p className="text-sm text-muted-foreground mt-1">€850</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CMD-2025-010</p>
                    <p className="text-sm text-muted-foreground">
                      Pierre Durand
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Livrée</Badge>
                    <p className="text-sm text-muted-foreground mt-1">€2,100</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">CMD-2025-009</p>
                    <p className="text-sm text-muted-foreground">
                      Sophie Leblanc
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">Livrée</Badge>
                    <p className="text-sm text-muted-foreground mt-1">€675</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Répartition par statut */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Répartition des commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span>En attente</span>
                  </div>
                  <span className="font-medium">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span>En cours</span>
                  </div>
                  <span className="font-medium">24</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span>Prêt expédition</span>
                  </div>
                  <span className="font-medium">8</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span>Expédiée</span>
                  </div>
                  <span className="font-medium">45</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                    <span>Livrée</span>
                  </div>
                  <span className="font-medium">67</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration et outils */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configuration & Outils de diagnostic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Outils de test</h4>
                <div className="space-y-2">
                  <Link href="/test-supabase" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TestTube className="h-4 w-4 mr-2" />
                      Test connexion Supabase
                    </Button>
                  </Link>

                  <Link href="/test-auth" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <TestTube className="h-4 w-4 mr-2" />
                      Test authentification
                    </Button>
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Statut utilisateur</h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Email :</strong> {user?.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>ID :</strong> {user?.id?.substring(0, 8)}...
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Authentification active
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
