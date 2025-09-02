'use client';

import CommandesList from '@/components/CommandesList';

export default function CommandesPage() {
  //const { isAuthenticated, user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <CommandesList />
    </div>
  );
}
