'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Users, Search, ShoppingCart, Euro, Calendar, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useClients, useClientsStats } from '@/hooks/useClients';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ProtectedRoute from '@/components/ProtectedRoute';
import SyncExtrabatClientsButton from '@/components/SyncExtrabatClientsButton';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: clients, isLoading, refetch } = useClients(searchTerm);
  const { data: stats, isLoading: statsLoading } = useClientsStats();

  return (
    <ProtectedRoute>
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
            <div className="flex items-center gap-2">
              <SyncExtrabatClientsButton />
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
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
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.totalClients || 0}
                </p>
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
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.activeThisMonth || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Nouveaux ce mois
                </p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : stats?.newThisMonth || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un client (nom, email)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Liste des clients</span>
              {!isLoading && clients && (
                <Badge variant="secondary">{clients.length} client{clients.length > 1 ? 's' : ''}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : !clients || clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'Aucun client trouvé pour cette recherche' : 'Aucun client dans la base'}
                </p>
                {!searchTerm && (
                  <p className="text-sm text-gray-500 mt-2">
                    Synchronisez depuis ExtraBat pour importer vos clients
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => {
                  const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
                  const colorIndex = parseInt(client.id.toString()) % colors.length;
                  const color = colors[colorIndex];

                  return (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                          <Users className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{client.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            {client.email && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </span>
                            )}
                            {client.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {client.city}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span>{client.commandes_count || 0} commande{(client.commandes_count || 0) > 1 ? 's' : ''}</span>
                          </div>
                          {client.total_commandes_ttc !== undefined && client.total_commandes_ttc > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                              <Euro className="h-3 w-3" />
                              <span>{client.total_commandes_ttc.toFixed(2)} €</span>
                            </div>
                          )}
                          {client.last_commande_date && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(client.last_commande_date), 'dd/MM/yyyy', { locale: fr })}</span>
                            </div>
                          )}
                        </div>

                        <Link href={`/commandes?client_id=${client.id}`}>
                          <Button variant="outline" size="sm">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Voir commandes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
