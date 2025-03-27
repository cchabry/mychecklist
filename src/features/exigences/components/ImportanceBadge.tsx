
/**
 * Badge affichant le niveau d'importance d'une exigence
 */

import { Badge } from '@/components/ui/badge';
import { ImportanceLevel } from '@/types/enums';
import { IMPORTANCE_LEVEL_MAPPING } from '../constants';
import { cn } from '@/lib/utils';

interface ImportanceBadgeProps {
  importance: ImportanceLevel;
  className?: string;
  withLabel?: boolean;
}

/**
 * Badge affichant le niveau d'importance d'une exigence avec une couleur correspondante
 */
export function ImportanceBadge({ importance, className, withLabel = true }: ImportanceBadgeProps) {
  const mapping = IMPORTANCE_LEVEL_MAPPING[importance] || IMPORTANCE_LEVEL_MAPPING[ImportanceLevel.NotApplicable];
  
  return (
    <Badge className={cn(mapping.color, className)}>
      {withLabel ? mapping.label : importance}
    </Badge>
  );
}
