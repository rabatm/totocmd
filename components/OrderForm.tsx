'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useOrderForm } from '@/hooks/useOrderForm';
import React from 'react';
import ClientSelect from './ClientSelect';
import ProductTable from './ProductTable';

interface OrderFormProps {
  children?: React.ReactNode;
}

const OrderForm: React.FC<OrderFormProps> = ({ children }) => {
  const {
    client,
    setClient,
    products,
    addProduct,
    removeProduct,
    validate,
    reset,
  } = useOrderForm();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (!v.valid) {
      setError(v.error || 'Erreur inconnue');
      return;
    }
    // TODO: Appel API/Supabase ici
    setSuccess('Commande créée (mock)');
    reset();
  }

  return (
    <Card>
      <CardHeader>Créer une commande</CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <ClientSelect
              value={client?.id || ''}
              onValueChange={(clientId: string) => {
                // Nous devrons récupérer le client complet via une query
                // Pour l'instant, on simule avec un objet minimal
                if (clientId) {
                  setClient({ id: clientId, name: 'Client sélectionné' });
                } else {
                  setClient(null);
                }
              }}
            />
          </div>
          <div className="mb-4">
            <ProductTable
              products={products}
              onAdd={addProduct}
              onRemove={removeProduct}
            />
          </div>
          <Button type="submit">Créer la commande</Button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {children}
      </CardContent>
    </Card>
  );
};

export default OrderForm;
