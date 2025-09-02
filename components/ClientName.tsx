'use client';

import { useClient } from '@/hooks/useClients';

interface ClientNameProps {
  clientId: number;
}

export default function ClientName({ clientId }: ClientNameProps) {
  const { data: client, isLoading, error } = useClient(clientId);

  if (isLoading) {
    return (
      <div>
        <div className="font-medium">Chargement...</div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div>
        <div className="font-medium text-gray-500">Client ID: {clientId}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="font-medium">{client.name}</div>
    </div>
  );
}
