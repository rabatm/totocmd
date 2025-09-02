'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = () => {
  const router = useRouter();
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signOut,
    signUp,
    resetPassword: storeResetPassword,
    initializeAuth,
    clearError,
  } = useAuthStore();

  // Initialiser l'authentification au premier rendu - une seule fois
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (isMounted) {
        await initializeAuth();
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []); // Tableau vide pour n'exécuter qu'une fois

  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      console.log('Utilisateur non authentifié, redirection vers /login');
      router.push('/login');
      return false;
    }
    return true;
  };

  const redirectIfAuthenticated = (redirectTo: string = '/dashboard') => {
    if (isAuthenticated && !isLoading) {
      router.push(redirectTo);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await signOut();
    router.push('/login');
  };

  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.success) {
      router.push('/dashboard');
    }
    return result;
  };

  const register = async (
    email: string,
    password: string,
    userData?: Record<string, unknown>,
  ) => {
    return await signUp(email, password, userData);
  };

  const resetPassword = async (email: string) => {
    return await storeResetPassword(email);
  };

  return {
    // État
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    error,

    // Actions
    login,
    logout,
    register,
    resetPassword,
    requireAuth,
    redirectIfAuthenticated,
    clearError,

    // Actions directes du store (pour compatibilité)
    signIn,
    signOut,
    signUp,
  };
};
