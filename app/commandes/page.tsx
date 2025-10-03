'use client';

import CommandesList from '@/components/CommandesList';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Suspense } from 'react';

export default function CommandesPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <Suspense fallback={<div className="flex items-center justify-center p-8">Chargement...</div>}>
          <CommandesList />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
