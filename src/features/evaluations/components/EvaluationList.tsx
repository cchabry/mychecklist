
import React from 'react';
import { Evaluation } from '../types';
import { EvaluationCard } from './EvaluationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EvaluationListProps {
  evaluations: Evaluation[];
  exigenceTitles?: Record<string, string>;
  pageTitles?: Record<string, string>;
  onEvaluationClick?: (evaluationId: string) => void;
  emptyStateMessage?: string;
  className?: string;
}

/**
 * Liste des évaluations
 * 
 * Ce composant affiche une liste d'évaluations sous forme de cartes
 * avec une indication lorsque la liste est vide.
 */
export const EvaluationList: React.FC<EvaluationListProps> = ({
  evaluations,
  exigenceTitles = {},
  pageTitles = {},
  onEvaluationClick,
  emptyStateMessage = "Aucune évaluation",
  className
}) => {
  if (evaluations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Évaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">{emptyStateMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {evaluations.map((evaluation) => (
        <EvaluationCard
          key={evaluation.id}
          evaluation={evaluation}
          exigenceTitle={exigenceTitles[evaluation.exigenceId]}
          pageTitle={pageTitles[evaluation.pageId]}
          onClick={() => onEvaluationClick?.(evaluation.id)}
        />
      ))}
    </div>
  );
};

export default EvaluationList;
