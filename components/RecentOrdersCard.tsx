'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CommandeWithDetails } from '@/src/types';
import { Clock, User, Package } from 'lucide-react';
import Link from 'next/link';

interface RecentOrdersCardProps {
  orders: CommandeWithDetails[];
}

const statusConfig = {
  en_attente: { label: 'En attente', color: 'bg-gray-100 text-gray-800' },
  en_attente_dacompte: { label: 'Attente acompte', color: 'bg-yellow-100 text-yellow-800' },
  en_cours: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  pret_expedition: { label: 'Prêt', color: 'bg-green-100 text-green-800' },
  expedie: { label: 'Expédié', color: 'bg-purple-100 text-purple-800' },
  annule: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
};

export default function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Commandes récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune commande récente</p>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/commandes/${order.id}`}
              className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {order.numero_commande}
                    </h4>
                    <Badge
                      className={statusConfig[order.etat]?.color || 'bg-gray-100 text-gray-800'}
                    >
                      {statusConfig[order.etat]?.label || order.etat}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {order.clients?.name || order.client?.name || 'Client inconnu'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {order.commande_produits?.length || 0} produit(s)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {order.total_ttc.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.created_at &&
                      new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })
                    }
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}