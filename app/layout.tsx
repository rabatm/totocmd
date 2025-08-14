import Header from '@/components/Header';
import Providers from '@/components/Providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import AuthInitializer from '@/components/AuthInitializer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TotoCmd - Gestion des commandes',
  description: 'Application de gestion des commandes avec Supabase',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthInitializer />
          <Header />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
