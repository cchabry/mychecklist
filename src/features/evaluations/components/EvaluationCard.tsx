
import React from 'react';
import { Evaluation } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplianceLevel } from '@/types/enums';
import { SCORE_DESCRIPTIONS } from '../constants';

const scoreBadgeColors: Record<ComplianceLevel, string> = {
  [ComplianceLevel.Compliant]: 'bg-green-100 text-green-800',
  [ComplianceLevel.PartiallyCompliant]: 'bg-yellow-100 text-yellow-800',
  [ComplianceLevel.NonCompliant]: 'bg-red-100 text-red-800',
  [ComplianceLevel.NotApplicable]: 'bg-gray-100 text-gray-800'
};

interface EvaluationCardProps {
  evaluation: Evaluation;
  exigenceTitle?: string;
  pageTitle?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Carte pour afficher une évaluation
 * 
 * Ce composant présente les informations principales d'une évaluation:
 * score, commentaire, page évaluée et exigence concernée.
 */
export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  evaluation,
  exigenceTitle,
  pageTitle,
  onClick,
  className = ''
}) => {
  const scoreBadgeClass = scoreBadgeColors[evaluation.score] || 'bg-gray-100 text-gray-800';
  const formattedDate = new Date(evaluation.updatedAt).toLocaleDateString();

  return (
    <Card 
      className={`w-full transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">
            {pageTitle ? `Évaluation de ${pageTitle}` : `Évaluation #${evaluation.id.slice(0, 8)}`}
          </CardTitle>
          <Badge className={scoreBadgeClass}>
            {evaluation.score}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {exigenceTitle && (
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">Exigence: </span>
            <span className="text-sm font-medium">{exigenceTitle}</span>
          </div>
        )}
        
        {evaluation.comment && (
          <p className="text-sm mt-2 line-clamp-3">{evaluation.comment}</p>
        )}
        
        {evaluation.attachments && evaluation.attachments.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {evaluation.attachments.length} pièce(s) jointe(s)
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Dernière mise à jour: {formattedDate}
      </CardFooter>
    </Card>
  );
};

export default EvaluationCard;
