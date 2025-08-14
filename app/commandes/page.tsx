'use client';

import CommandesList from '@/components/CommandesList';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function CommandesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des commandes
          </h1>
          <p className="text-gray-600">
            Visualisez et gérez toutes vos commandes
          </p>
        </div>
        <Link href="/commandes/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Button>
        </Link>
      </div>

      <SupabaseConnectionTest />
      <CommandesList />
    </div>
  );
}
