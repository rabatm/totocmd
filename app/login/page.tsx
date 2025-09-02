'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Composant enfant qui utilise useSearchParams
function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    signIn,
    signUp,
    isAuthenticated,
    isLoading: authLoading,
    user,
    session,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, redirectTo]);

  const validateForm = () => {
    if (!email.trim()) {
      setError("L'email est requis");
      return false;
    }
    if (!email.includes('@')) {
      setError("Format d'email invalide");
      return false;
    }
    if (!password.trim()) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (isSignUp && password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const result = isSignUp
        ? await signUp(email.trim(), password)
        : await signIn(email.trim(), password);
      if (result.success) {
        if (isSignUp) {
          setError('');
          alert(
            'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.',
          );
          setIsSignUp(false);
        } else {
          router.push(redirectTo);
        }
      } else {
        setError(result.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'Créer un compte' : 'Connexion'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? 'Créez votre compte pour accéder à TotoCmd'
              : 'Connectez-vous à votre compte TotoCmd'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={
                    isSignUp ? 'Au moins 6 caractères' : 'Votre mot de passe'
                  }
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Création...' : 'Connexion...'}
                </>
              ) : isSignUp ? (
                'Créer le compte'
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={toggleMode}
              disabled={loading}
              className="text-sm"
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : "Pas de compte ? S'inscrire"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant principal avec Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
