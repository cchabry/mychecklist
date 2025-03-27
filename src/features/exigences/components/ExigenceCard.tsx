
/**
 * Carte affichant les détails d'une exigence
 */

import { Edit, Info } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImportanceBadge } from './ImportanceBadge';
import { ExigenceWithItem } from '../types';
import { cn } from '@/lib/utils';

interface ExigenceCardProps {
  exigence: ExigenceWithItem;
  onEdit?: () => void;
  onClick?: () => void;
  className?: string;
  href?: string; // Pour compatibilité avec ProjectExigencesPage
}

/**
 * Carte affichant les détails d'une exigence
 */
export function ExigenceCard({ exigence, onEdit, onClick, className }: ExigenceCardProps) {
  const { checklistItem } = exigence;
  
  if (!checklistItem) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-base font-medium">Exigence non trouvée</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card 
      className={cn(
        "w-full transition-shadow hover:shadow-md",
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-medium line-clamp-2">
            {checklistItem.consigne}
          </CardTitle>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <ImportanceBadge importance={exigence.importance} />
          
          {checklistItem.category && (
            <Badge variant="outline" className="bg-muted/50">
              {checklistItem.category}
            </Badge>
          )}
          
          {checklistItem.subcategory && (
            <Badge variant="outline" className="bg-muted/50">
              {checklistItem.subcategory}
            </Badge>
          )}
        </div>
        
        {exigence.comment && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md flex gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{exigence.comment}</p>
          </div>
        )}
        
        {!exigence.comment && checklistItem.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{checklistItem.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex gap-2 flex-wrap">
          {checklistItem.reference?.map((ref: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {ref}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

export default ExigenceCard;
