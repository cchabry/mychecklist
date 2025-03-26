
import React from 'react';
import { ChecklistItemCard, ChecklistItemProps } from './ChecklistItemCard';
import { cn } from '@/lib/utils';

export interface ChecklistItemGridProps {
  items: Omit<ChecklistItemProps, 'onClick' | 'onEdit' | 'className'>[];
  onItemClick?: (itemId: string) => void;
  onItemEdit?: (itemId: string) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * Grille d'affichage des items de checklist
 */
export const ChecklistItemGrid: React.FC<ChecklistItemGridProps> = ({
  items,
  onItemClick,
  onItemEdit,
  className,
  columns = 3,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn(
      "grid gap-4", 
      gridCols[columns],
      className
    )}>
      {items.map((item) => (
        <ChecklistItemCard
          key={item.id}
          {...item}
          onClick={() => onItemClick?.(item.id)}
          onEdit={onItemEdit ? () => onItemEdit(item.id) : undefined}
        />
      ))}
    </div>
  );
};

export default ChecklistItemGrid;
