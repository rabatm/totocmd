'use client';
import { useAuthStore } from '@/lib/auth-store';
import { useEffect } from 'react';

const AuthInitializer = () => {
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null;
};

export default AuthInitializer;
