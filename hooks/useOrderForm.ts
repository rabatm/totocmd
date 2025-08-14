'use client';

import { Client, CommandeProduit } from '@/src/types';
import { useState } from 'react';

// Types temporaires pour le formulaire (en attendant la création des vrais types produits)
export interface Product {
  id: string;
  name: string;
  type: 'standard' | 'pc';
  price?: number;
}

export interface OrderFormState {
  client: Client | null;
  products: Product[];
  lines: CommandeProduit[];
}

export function useOrderForm() {
  const [client, setClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<CommandeProduit[]>([]);

  // Ajout d'un produit à la commande
  function addProduct(product: Product) {
    setProducts(prev => [...prev, product]);
    setLines(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        commande_id: '', // Sera défini lors de la création de la commande
        personnel_id: 1, // Valeur par défaut, à modifier selon votre logique
        nom_produit: product.name,
        code_produit: product.id,
        numero_serie: '',
        quantite: 1,
        statut: 'scanne',
        date_scan: new Date().toISOString(),
        remarque: '',
      },
    ]);
  }

  // Suppression d'un produit
  function removeProduct(productId: string) {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setLines(prev => prev.filter(l => l.code_produit !== productId));
  }

  // Mise à jour de la quantité
  function updateQuantity(productId: string, quantity: number) {
    setLines(prev =>
      prev.map(line =>
        line.code_produit === productId
          ? { ...line, quantite: quantity }
          : line,
      ),
    );
  }

  // Validation du formulaire
  function validate() {
    if (!client) return { valid: false, error: 'Client obligatoire' };
    if (lines.length === 0)
      return { valid: false, error: 'Au moins un produit requis' };
    return { valid: true };
  }

  // Reset du formulaire
  function reset() {
    setClient(null);
    setProducts([]);
    setLines([]);
  }

  return {
    client,
    setClient,
    products,
    addProduct,
    removeProduct,
    updateQuantity,
    lines,
    setLines,
    validate,
    reset,
  };
}
