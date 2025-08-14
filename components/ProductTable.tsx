import React from 'react';
// import { Table } from "@/components/ui/table"; // à activer si shadcn/ui installé

import type { Product } from '@/hooks/useOrderForm';

interface ProductTableProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onAdd,
  onRemove,
}) => {
  // Squelette du composant (logique à ajouter)
  return (
    <div>
      <label className="block mb-1 font-medium">Produits</label>
      <div className="border rounded p-2 text-gray-400">
        {products.length === 0 ? (
          <>Aucun produit sélectionné</>
        ) : (
          <ul>
            {products.map(p => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.name}</span>
                <button
                  type="button"
                  className="text-red-500 ml-2"
                  onClick={() => onRemove(p.id)}
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* TODO: bouton d'ajout de produit (mock) */}
        <button
          type="button"
          className="mt-2 text-blue-600 underline"
          onClick={() =>
            onAdd({
              id: Math.random().toString(36).slice(2),
              name: 'Produit démo',
              type: 'standard',
              price: 99.99,
            })
          }
        >
          Ajouter un produit (démo)
        </button>
      </div>
    </div>
  );
};

export default ProductTable;
