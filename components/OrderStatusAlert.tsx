'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderStatusAlertProps {
  currentStatus: string;
  progression: number;
  orderNumber: string;
}

export default function OrderStatusAlert({
  currentStatus,
  progression,
  orderNumber,
}: OrderStatusAlertProps) {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Afficher l'alerte si la commande est automatiquement passée à "prêt expédition"
    if (progression === 100 && currentStatus === 'pret_expedition') {
      setShowAlert(true);
      // Masquer après 5 secondes
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [progression, currentStatus]);

  if (!showAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right-full">
      <Alert className="border-green-200 bg-green-50 text-green-800 shadow-lg">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertDescription className="flex items-center gap-2">
          <div className="flex-1">
            <p className="font-semibold">Commande terminée !</p>
            <p className="text-sm">
              La commande {orderNumber} est automatiquement passée à "Prêt expédition"
              car tous les produits sont prêts.
            </p>
          </div>
          <Package className="h-6 w-6 text-green-600" />
        </AlertDescription>
      </Alert>
    </div>
  );
}