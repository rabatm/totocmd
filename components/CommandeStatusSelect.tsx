'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateCommandeStatus } from '@/hooks/useMutations';
import { CommandeStatus } from '@/src/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface CommandeStatusSelectProps {
  commandeId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: CommandeStatus.EN_ATTENTE, label: 'EN ATTENTE' },
  { value: CommandeStatus.EN_ATTENTE_DACOMPTE, label: "EN ATTENTE D'ACOMPTE" },
  { value: CommandeStatus.EN_COURS, label: 'EN COURS' },
  { value: CommandeStatus.PRET_EXPEDITION, label: 'PRÊT EXPÉDITION' },
  { value: CommandeStatus.EXPEDIE, label: 'EXPÉDIÉE' },
  { value: CommandeStatus.ANNULE, label: 'ANNULÉE' },
];

export default function CommandeStatusSelect({
  commandeId,
  currentStatus,
}: CommandeStatusSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateStatus = useUpdateCommandeStatus();

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateStatus.mutateAsync({
        id: commandeId,
        etat: newStatus,
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
        <SelectTrigger className="w-48">
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
