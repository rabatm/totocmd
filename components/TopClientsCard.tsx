'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Crown, TrendingUp } from 'lucide-react';

interface TopClient {
  name: string;
  commandes: number;
  total: number;
}

interface TopClientsCardProps {
  clients: TopClient[];
}

export default function TopClientsCard({ clients }: TopClientsCardProps) {
  const maxTotal = Math.max(...clients.map(c => c.total), 1);

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          Top Clients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun client trouvé</p>
          </div>
        ) : (
          clients.map((client, index) => (
            <div key={client.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }
                  `}>
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{client.name}</h4>
                    <p className="text-xs text-gray-500">
                      {client.commandes} commande{client.commandes > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {client.total.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {Math.round((client.total / maxTotal) * 100)}%
                  </div>
                </div>
              </div>
              <Progress
                value={(client.total / maxTotal) * 100}
                className="h-2"
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}