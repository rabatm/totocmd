# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Architecture Overview

TotoCmd is a Next.js 15 order management application built with the App Router architecture and TypeScript. The application manages orders, clients, products, personnel, and shipments using Supabase as the backend with ExtraBat integration for external data synchronization.

### Core Technology Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Database & Backend**: Supabase (PostgreSQL, authentication, real-time subscriptions)
- **State Management**:
  - Zustand for authentication state (`lib/auth-store.ts`)
  - TanStack React Query for server state, data fetching, and caching
- **UI Framework**: shadcn/ui components with Radix UI primitives and Tailwind CSS
- **PDF Generation**: jsPDF for shipping labels and QR codes
- **External Integration**: ExtraBat API for client and product synchronization

### Directory Structure

```
app/
├── api/                         # Next.js API routes (server-side logic)
│   ├── commandes/              # Order CRUD operations
│   ├── shipments/              # Shipment and multi-package management
│   ├── chronopost/             # Chronopost tracking integration
│   ├── sync/                   # ExtraBat synchronization endpoints
│   └── personnel/              # Staff management
├── commandes/[id]/             # Order detail pages
├── clients/                    # Client management pages
├── shipments/                  # Shipment workflow pages
├── dashboard/                  # Main dashboard with stats
├── login/                      # Authentication pages
└── layout.tsx                  # Root layout with Providers and AuthInitializer

components/
├── ui/                         # shadcn/ui base components (Button, Dialog, etc.)
├── dashboard/                  # Dashboard-specific widgets
├── shipments/                  # Shipment workflow components
├── Providers.tsx               # React Query provider setup
├── AuthInitializer.tsx         # Supabase auth session initialization
└── ProtectedRoute.tsx          # Route protection wrapper

hooks/
├── useAuth.ts                  # Authentication hook wrapper
├── useCommandes.ts             # Order data fetching
├── useCommandeMutations.ts     # Order mutations (create/update/delete)
├── useCommandeProduits.ts      # Order products data
├── useClients.ts               # Client data fetching
├── usePersonnel.ts             # Personnel data
├── useShipments.ts             # Shipment data fetching
├── useShipmentMutations.ts     # Shipment mutations
├── useShipmentWorkflow.ts      # Shipment workflow state management
├── useChronopostTracking.ts    # Chronopost tracking integration
└── useProduits.ts              # Product catalog data

lib/
├── auth-store.ts               # Zustand authentication store
├── supabaseClient.ts           # Supabase client initialization
├── extrabatSync.ts             # ExtraBat product sync logic
├── syncExtrabatClients.ts      # ExtraBat client sync logic
├── chronopost-api.ts           # Chronopost API integration
├── shop-config.ts              # Shop configuration
└── utils.ts                    # Utility functions

src/types/
└── index.ts                    # TypeScript type definitions for all entities
```

### Database Schema (Supabase)

Core tables with their purposes:

- **`client`** - Customer information with ExtraBat integration (`extrabat_id` field)
- **`personnel`** - Staff/employee data for order assignment and shipment workflow
- **`commande`** - Main orders table with status tracking and progression
- **`commande_produit`** - Order line items with product details, quantities, and independent status tracking
- **`produit`** - Product catalog synced from ExtraBat with stock management
- **`mouvement_stock`** - Stock movement tracking (inventory, reception)
- **`shipments`** - Shipment management with multi-package support
- **`shipment_produits`** - Products assigned to shipments with packaging details
- **`shipment_colis`** - Individual package tracking with Chronopost integration

### Authentication & Security

Supabase Auth implementation:
- **Email/password authentication** with custom error messages in French
- **Zustand store** (`lib/auth-store.ts`) manages client-side auth state with `initializeAuth()` initialization
- **AuthInitializer component** (`components/AuthInitializer.tsx`) in root layout handles session recovery and auth state changes
- **ProtectedRoute wrapper** for secured page access
- **Row Level Security (RLS)** policies on all Supabase tables
- Session state synchronized via `onAuthStateChange` listener in auth store

### Key Application Features

1. **Order Management Workflow**
   - Multi-status order tracking: `en_attente`, `en_attente_dacompte`, `en_cours`, `pret_expedition`, `expedie`, `annule`
   - Independent product status per order line: `scanne`, `reserve`, `en_preparation`, `pret_expedition`, `expedie`, `livre`
   - Automatic progression calculation based on product status
   - Real-time updates using Supabase subscriptions

2. **Shipment Multi-Package System**
   - Complete workflow: preparation → verification → shipment → delivery
   - Multiple packages per shipment with individual Chronopost tracking numbers
   - Personnel assignment (preparateur/verificateur) with validation rules
   - Package management: weight, dimensions, tracking per package
   - Integration with order products for shipment creation

3. **ExtraBat Integration**
   - Bidirectional sync for clients and products
   - Automatic product catalog updates with stock tracking
   - Client data synchronization with deduplication by `extrabat_id`
   - API endpoints: `/api/sync/clients`, `/api/sync-produits`

4. **Stock Management**
   - Real-time stock tracking with movements history
   - Two movement types: `inventaire` (inventory adjustment), `reception` (receiving)
   - Stock updates linked to order product status changes

5. **QR Code & PDF Generation**
   - Product scanning for order fulfillment
   - Shipping label generation with QR codes using jsPDF
   - Individual package labels with tracking information

### Data Flow Patterns

1. **Authentication Flow**:
   - `AuthInitializer` calls `initializeAuth()` on mount
   - `useAuthStore` provides auth state globally
   - `ProtectedRoute` checks `isAuthenticated` before rendering

2. **Data Fetching Pattern**:
   - Custom hooks use React Query with Supabase client
   - Centralized query keys for cache management
   - Real-time subscriptions for live data updates
   - Optimistic updates for mutations

3. **API Route Pattern**:
   - Server-side routes in `app/api/` for business logic
   - Supabase client with service role for privileged operations
   - ExtraBat API proxy for external data sync

### Environment Configuration

Required in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ExtraBat Integration
EXTRABAT_API_URL=https://api.extrabat.com
EXTRABAT_API_KEY=your-extrabat-api-key

# Optional
CHRONOPOST_API_KEY=your-chronopost-api-key
```

### Type System

All types defined in `src/types/index.ts`:
- Database entities: `Client`, `Personnel`, `Commande`, `CommandeProduit`, `Produit`, `Shipment`
- Status enums: `CommandeStatus`, `ProduitStatus`, `ShipmentStatus`, `ColisStatus`
- Form inputs: `CreateCommandeInput`, `CreateShipmentInput`, `CreateMouvementStockInput`
- Enriched types with relations: `CommandeWithDetails`, `ShipmentWithDetails`

### Development Guidelines

- **Database operations**: Always use Supabase client, never raw SQL in components
- **TypeScript**: Strict typing, avoid `any`, use defined types from `src/types/index.ts`
- **Component patterns**: Business logic in hooks (`hooks/`), UI logic in components
- **Mutations**: Use React Query mutations with optimistic updates and cache invalidation
- **Forms**: Controlled components with validation before submission
- **Real-time**: Use Supabase subscriptions in hooks, not directly in components
- **Error handling**: French error messages, user-friendly feedback
- **Testing**: Diagnostic routes (`/diagnostic-auth`, `/test-auth`) for auth debugging

### Important Behavioral Notes

- **Personnel assignment**: Preparateur and Verificateur must be different people (enforced in shipment creation)
- **Product status flow**: Status changes trigger stock updates and order progression recalculation
- **Multi-package shipments**: Each package (colis) has independent tracking and status
- **ExtraBat sync**: Upsert logic based on `extrabat_id` to prevent duplicates