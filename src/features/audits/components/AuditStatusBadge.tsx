
/**
 * Badge affichant le statut d'un audit avec une couleur correspondante
 */

import { Badge } from '@/components/ui/badge';
import { AUDIT_STATUS } from '../constants';
import { cn } from '@/lib/utils';

interface AuditStatusBadgeProps {
  status: string;
  className?: string;
}

export function AuditStatusBadge({ status, className }: AuditStatusBadgeProps) {
  // Déterminer la classe de couleur en fonction du statut
  const getVariant = () => {
    switch (status) {
      case AUDIT_STATUS.DRAFT:
        return 'bg-gray-200 text-gray-700';
      case AUDIT_STATUS.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700';
      case AUDIT_STATUS.COMPLETED:
        return 'bg-green-100 text-green-700';
      case AUDIT_STATUS.ARCHIVED:
        return 'bg-gray-100 text-gray-500';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <Badge className={cn(getVariant(), className)}>
      {status}
    </Badge>
  );
}
