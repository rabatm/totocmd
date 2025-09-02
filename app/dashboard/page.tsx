'use client';

import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* ...existing code... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ...existing code... */}
      </div>

      {/* Configuration et outils */}
      <Card className="mt-6">{/* ...existing code... */}</Card>
    </div>
  );
}
