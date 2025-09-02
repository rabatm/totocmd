'use client';

import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = props => {
  const { children, fallback } = props;
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log(
    '[ProtectedRoute] isAuthenticated:',
    isAuthenticated,
    'user:',
    user,
    'isLoading:',
    isLoading,
  );

  // Attendre que le chargement soit terminé ET que user soit défini ou null
  if (isLoading || typeof user === 'undefined') {
    console.log('[ProtectedRoute] Loader rendu');
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement...</span>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated && !isLoading) {
    console.log(
      '[ProtectedRoute] Utilisateur non authentifié, redirection vers /login',
    );
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  console.log(
    '[ProtectedRoute] Utilisateur authentifié, affichage du contenu.',
  );
  return <>{children}</>;
};

export default ProtectedRoute;
