'use client';

import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading, requireAuth } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      requireAuth();
    }
  }, [isLoading, requireAuth]);

  if (isLoading) {
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
