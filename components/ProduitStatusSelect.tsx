'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateProduitStatus } from '@/hooks/useProduitStatus';
import { ProduitStatus } from '@/src/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProduitStatusSelectProps {
  produitId: string;
  commandeId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: ProduitStatus.SCANNE, label: 'Scanné' },
  { value: ProduitStatus.EN_PREPARATION, label: 'En préparation' },
  { value: ProduitStatus.PRET_EXPEDITION, label: 'Prêt expédition' },
  { value: ProduitStatus.EXPEDIE, label: 'Expédié' },
  { value: ProduitStatus.LIVRE, label: 'Livré' },
];

export default function ProduitStatusSelect({
  produitId,
  commandeId,
  currentStatus,
}: ProduitStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateStatus = useUpdateProduitStatus();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatus.mutateAsync({
        produitId,
        commandeId,
        newStatus,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentLabel = () => {
    const option = statusOptions.find(opt => opt.value === currentStatus);
    return option?.label || currentStatus;
  };

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder={getCurrentLabel()} />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
    </div>
  );
}
