import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    },
  );

  // Vérifier la session utilisateur
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/login', '/'];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    // Ajouter l'URL de retour pour rediriger après connexion
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si l'utilisateur est connecté et tente d'accéder à la page de login
  if (session && request.nextUrl.pathname === '/login') {
    const redirectTo =
      request.nextUrl.searchParams.get('redirectTo') || '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
