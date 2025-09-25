'use client';

import CommandesList from '@/components/CommandesList';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CommandesPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <CommandesList />
      </div>
    </ProtectedRoute>
  );
}
