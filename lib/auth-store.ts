'use client';

import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from './supabaseClient';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  // Suppression du flag initialized
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData?: Record<string, unknown>,
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(set => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  // Suppression du flag initialized

  clearError: () => set({ error: null }),

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user, error: null });
  },

  setSession: (session: Session | null) => {
    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session?.user,
      error: null,
    });
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // Validation côté client
      if (!email.trim() || !password.trim()) {
        const error = 'Email et mot de passe requis';
        set({ error, isLoading: false });
        return { success: false, error };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Erreur de connexion:', error);
        let errorMessage = 'Erreur de connexion';

        // Messages d'erreur personnalisés
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage =
            'Veuillez confirmer votre email avant de vous connecter';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
        }

        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }

      if (data.user && data.session) {
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      }

      const fallbackError = 'Données de connexion invalides';
      set({ error: fallbackError, isLoading: false });
      return { success: false, error: fallbackError };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      const errorMessage = 'Erreur de connexion réseau';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  signUp: async (email: string, password: string, userData = {}) => {
    try {
      set({ isLoading: true, error: null });

      // Validation côté client
      if (!email.trim() || !password.trim()) {
        const error = 'Email et mot de passe requis';
        set({ error, isLoading: false });
        return { success: false, error };
      }

      if (password.length < 6) {
        const error = 'Le mot de passe doit contenir au moins 6 caractères';
        set({ error, isLoading: false });
        return { success: false, error };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        console.error("Erreur d'inscription:", error);
        let errorMessage = "Erreur lors de l'inscription";

        if (error.message.includes('User already registered')) {
          errorMessage = 'Un compte existe déjà avec cette adresse email';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Format d'email invalide";
        }

        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        // Si l'email doit être confirmé, on n'initialise pas la session
        if (data.session) {
          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            error: null,
          });
        } else {
          set({ error: null });
        }
        set({ isLoading: false });
        return { success: true };
      }

      const fallbackError = "Erreur lors de l'inscription";
      set({ error: fallbackError, isLoading: false });
      return { success: false, error: fallbackError };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      const errorMessage = 'Erreur de connexion réseau';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });

      if (!email.trim()) {
        const error = 'Email requis';
        set({ error, isLoading: false });
        return { success: false, error };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) {
        console.error('Erreur reset password:', error);
        const errorMessage =
          "Erreur lors de l'envoi de l'email de réinitialisation";
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }

      set({ isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      console.error('Erreur lors du reset password:', error);
      const errorMessage = 'Erreur de connexion réseau';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erreur de déconnexion:', error);
      }

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initializeAuth: async () => {
    // On initialise l'auth à chaque appel pour garantir la synchro
    try {
      set({ isLoading: true, error: null });

      // Récupérer la session actuelle
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log('[initializeAuth] session:', session);
      console.log('[initializeAuth] user:', session?.user);

      if (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        set({ error: "Erreur d'initialisation de l'authentification" });
      }

      set({
        user: session?.user || null,
        session: session || null,
        isAuthenticated: !!session?.user,
        error: null,
      });

      // Écouter les changements d'authentification (une seule fois)
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_OUT' || !session) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          set({
            user: session.user,
            session: session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'auth:", error);
      set({
        error: "Erreur d'initialisation de l'authentification",
        isLoading: false,
      });
    } finally {
      set(state => {
        console.log(
          '[initializeAuth] FIN - user:',
          state.user,
          'isAuthenticated:',
          state.isAuthenticated,
          'isLoading:',
          state.isLoading,
        );
        return { isLoading: false };
      });
    }
  },
}));
