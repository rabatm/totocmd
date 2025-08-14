'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Plus, Users } from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestion des clients
            </h1>
            <p className="text-muted-foreground">
              Gérez vos clients et leurs informations
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Statistiques clients */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Total clients
              </p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Mail className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Actifs ce mois
              </p>
              <p className="text-2xl font-bold">18</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                Nouveaux
              </p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Client exemple */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Jean Dupont</h3>
                  <p className="text-sm text-muted-foreground">
                    jean.dupont@email.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  5 commandes
                </span>
                <Button variant="outline" size="sm">
                  Voir détails
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Marie Martin</h3>
                  <p className="text-sm text-muted-foreground">
                    marie.martin@email.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  3 commandes
                </span>
                <Button variant="outline" size="sm">
                  Voir détails
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Pierre Durand</h3>
                  <p className="text-sm text-muted-foreground">
                    pierre.durand@email.com
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  8 commandes
                </span>
                <Button variant="outline" size="sm">
                  Voir détails
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
