
import React from 'react';
import { CorrectiveAction } from '../types';
import { ActionCard } from '@/components/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionListProps {
  actions: CorrectiveAction[];
  onActionClick?: (actionId: string) => void;
  emptyStateMessage?: string;
  className?: string;
}

/**
 * Liste des actions correctives
 * 
 * Ce composant affiche une liste d'actions correctives sous forme de cartes
 * avec une indication lorsque la liste est vide.
 */
export const ActionList: React.FC<ActionListProps> = ({
  actions,
  onActionClick,
  emptyStateMessage = "Aucune action corrective",
  className
}) => {
  if (actions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Actions correctives</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">{emptyStateMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          id={action.id}
          title={`Action corrective #${action.id.slice(0, 8)}`}
          description={action.comment}
          priority={action.priority as any}
          status={action.status as any}
          dueDate={action.dueDate}
          responsible={action.responsible}
          onClick={() => onActionClick?.(action.id)}
        />
      ))}
    </div>
  );
};

export default ActionList;
