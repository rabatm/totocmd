import { Badge } from '@/components/ui/badge';
import { CommandeStatus } from '@/src/types';

interface CommandeStatusBadgeProps {
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case CommandeStatus.EN_ATTENTE:
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case CommandeStatus.EN_ATTENTE_DACOMPTE:
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case CommandeStatus.EN_COURS:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case CommandeStatus.PRET_EXPEDITION:
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case CommandeStatus.EXPEDIE:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    case CommandeStatus.ANNULE:
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case CommandeStatus.EN_ATTENTE:
      return 'EN ATTENTE';
    case CommandeStatus.EN_ATTENTE_DACOMPTE:
      return 'EN ATTENTE D\'ACOMPTE';
    case CommandeStatus.EN_COURS:
      return 'EN COURS';
    case CommandeStatus.PRET_EXPEDITION:
      return 'PRÊT EXPÉDITION';
    case CommandeStatus.EXPEDIE:
      return 'EXPÉDIÉE';
    case CommandeStatus.ANNULE:
      return 'ANNULÉE';
    default:
      return status.toUpperCase();
  }
};

export default function CommandeStatusBadge({
  status,
}: CommandeStatusBadgeProps) {
  return (
    <Badge className={getStatusColor(status)}>{getStatusLabel(status)}</Badge>
  );
}
