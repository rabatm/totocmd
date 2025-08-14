'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const useAuth = () => {
  const router = useRouter();
  const authStore = useAuthStore();

  // Initialiser l'authentification au premier rendu
  useEffect(() => {
    authStore.initializeAuth();
  }, [authStore]);

  const requireAuth = () => {
    if (!authStore.isAuthenticated && !authStore.isLoading) {
      router.push('/login');
      return false;
    }
    return true;
  };

  const redirectIfAuthenticated = (redirectTo: string = '/dashboard') => {
    if (authStore.isAuthenticated && !authStore.isLoading) {
      router.push(redirectTo);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await authStore.signOut();
    router.push('/login');
  };

  const login = async (email: string, password: string) => {
    const result = await authStore.signIn(email, password);
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
    return await authStore.signUp(email, password, userData);
  };

  const resetPassword = async (email: string) => {
    return await authStore.resetPassword(email);
  };

  return {
    // État
    user: authStore.user,
    session: authStore.session,
    isLoading: authStore.isLoading,
    isAuthenticated: authStore.isAuthenticated,
    error: authStore.error,

    // Actions
    login,
    logout,
    register,
    resetPassword,
    requireAuth,
    redirectIfAuthenticated,
    clearError: authStore.clearError,

    // Actions directes du store (pour compatibilité)
    signIn: authStore.signIn,
    signOut: authStore.signOut,
    signUp: authStore.signUp,
  };
};
