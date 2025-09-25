'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp } from 'lucide-react';

interface StatusItem {
  statut: string;
  count: number;
  percentage: number;
}

interface StatusDistributionCardProps {
  title: string;
  data: StatusItem[];
  type: 'commandes' | 'produits';
}

const statusLabels = {
  // Commandes
  en_attente: 'EN ATTENTE',
  en_attente_dacompte: 'EN ATTENTE D\'ACOMPTE',
  en_cours: 'EN COURS',
  pret_expedition: 'PRÊT EXPÉDITION',
  expedie: 'EXPÉDIÉE',
  annule: 'ANNULÉE',
  // Produits
  scanne: 'SCANNÉ',
  reserve: 'RÉSERVÉ',
  en_preparation: 'EN PRÉPARATION',
  pret_expedition_produit: 'PRÊT EXPÉDITION',
  expedie_produit: 'EXPÉDIÉ',
  livre: 'LIVRÉ',
};

const statusColors = {
  // Commandes
  en_attente: 'bg-gray-500',
  en_attente_dacompte: 'bg-yellow-500',
  en_cours: 'bg-blue-500',
  pret_expedition: 'bg-green-500',
  expedie: 'bg-purple-500',
  annule: 'bg-red-500',
  // Produits
  scanne: 'bg-gray-500',
  reserve: 'bg-orange-500',
  en_preparation: 'bg-blue-500',
  pret_expedition_produit: 'bg-green-500',
  expedie_produit: 'bg-purple-500',
  livre: 'bg-green-500',
};

export default function StatusDistributionCard({
  title,
  data,
  type
}: StatusDistributionCardProps) {
  const sortedData = data.sort((a, b) => b.count - a.count);

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucune donnée disponible</p>
          </div>
        ) : (
          sortedData.map((item) => (
            <div key={item.statut} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    statusColors[item.statut as keyof typeof statusColors] || 
                    (type === 'produits' && item.statut === 'pret_expedition' ? statusColors.pret_expedition_produit :
                     type === 'produits' && item.statut === 'expedie' ? statusColors.expedie_produit : 'bg-gray-400')
                  }`} />
                  <span className="font-medium text-gray-700">
                    {statusLabels[item.statut as keyof typeof statusLabels] || 
                    (type === 'produits' && item.statut === 'pret_expedition' ? statusLabels.pret_expedition_produit :
                     type === 'produits' && item.statut === 'expedie' ? statusLabels.expedie_produit : item.statut)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {item.count}
                  </span>
                  <span className="text-sm text-gray-500 min-w-[3rem] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <Progress
                value={item.percentage}
                className="h-2"
              />
            </div>
          ))
        )}

        {sortedData.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-sm text-gray-500 text-center">
              Total: {sortedData.reduce((sum, item) => sum + item.count, 0)} {type}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}