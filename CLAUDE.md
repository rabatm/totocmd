# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Architecture Overview

TotoCmd is a Next.js 15 order management application built with the App Router architecture and TypeScript. The application manages orders, clients, products, and personnel using Supabase as the backend.

### Core Architecture

- **Framework**: Next.js 15 with App Router and TypeScript
- **Database & Auth**: Supabase (PostgreSQL, authentication, real-time)
- **State Management**:
  - Zustand for authentication state (`lib/auth-store.ts`)
  - TanStack React Query for data fetching and caching
- **UI Framework**: shadcn/ui components with Radix UI and Tailwind CSS
- **PDF Generation**: jsPDF for label printing

### Key Directory Structure

```
app/
├── api/                    # Next.js API routes
├── (main pages)/           # Order pages, client pages, product pages
├── dashboard/              # Main dashboard
├── login/                  # Authentication
└── layout.tsx             # Root layout with providers

components/
├── ui/                    # shadcn/ui base components
├── (business components)   # Order, client, product specific components
├── Providers.tsx          # React Query provider setup
├── AuthInitializer.tsx    # Authentication initialization
└── ProtectedRoute.tsx     # Route protection wrapper

lib/
├── auth-store.ts          # Zustand authentication store
├── supabase/              # Supabase client configuration
├── shop-config.ts         # Shop configuration
├── extrabatSync.ts        # External system sync
└── utils.ts              # Utility functions
```

### Database Schema

The application works with these main Supabase tables:
- `client` - Customer information with ExtraBat integration
- `personnel` - Staff/employee data for order assignment
- `commande` - Main orders table with status tracking
- `commande_produit` - Order line items with product details and status

### Authentication System

Uses Supabase Auth with:
- Email/password authentication
- Zustand store for client-side auth state (`lib/auth-store.ts`)
- `AuthInitializer` component for session management
- `ProtectedRoute` wrapper for secured pages
- Row Level Security (RLS) policies on all tables

### Key Features

- **Real-time Order Management**: Live updates using Supabase real-time
- **QR Code Integration**: Product scanning and labeling
- **PDF Label Generation**: Order labels with QR codes using jsPDF
- **ExtraBat Integration**: External system synchronization
- **Multi-status Workflow**: Orders and products have independent status tracking

### Environment Configuration

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Component Patterns

- Business logic is centralized in custom hooks and stores
- UI components follow shadcn/ui patterns with proper TypeScript typing
- Forms use controlled components with proper validation
- Data fetching uses React Query patterns with Supabase client

### Development Guidelines

- All database operations go through Supabase client
- Use TypeScript strictly - avoid `any` types
- Follow existing component structure and naming conventions
- Authentication state is managed through Zustand store
- UI components are built on shadcn/ui foundation
- Test authentication changes using the diagnostic pages (`/diagnostic-auth`, `/test-auth`)