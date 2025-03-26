
import React from 'react';
import { Edit, FileText, Users, Tag, Calendar, Info } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChecklistItemProps {
  id: string;
  consigne: string;
  description?: string;
  category?: string;
  subcategory?: string;
  references?: string[];
  profiles?: string[];
  phases?: string[];
  effort?: 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ';
  priority?: 'BASSE' | 'MOYENNE' | 'HAUTE';
  onClick?: () => void;
  onEdit?: () => void;
  className?: string;
}

const effortColors = {
  'FAIBLE': 'bg-green-100 text-green-800',
  'MOYEN': 'bg-yellow-100 text-yellow-800',
  'ÉLEVÉ': 'bg-red-100 text-red-800',
};

const priorityColors = {
  'BASSE': 'bg-blue-100 text-blue-800',
  'MOYENNE': 'bg-purple-100 text-purple-800',
  'HAUTE': 'bg-red-100 text-red-800',
};

/**
 * Carte affichant un item de checklist
 */
export const ChecklistItemCard: React.FC<ChecklistItemProps> = ({
  id,
  consigne,
  description,
  category,
  subcategory,
  references = [],
  profiles = [],
  phases = [],
  effort,
  priority,
  onClick,
  onEdit,
  className,
}) => {
  return (
    <Card 
      className={cn(
        "w-full transition-shadow hover:shadow-md cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium line-clamp-2">{consigne}</CardTitle>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
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
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          {category && (
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{category}</span>
            </div>
          )}
          
          {subcategory && (
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{subcategory}</span>
            </div>
          )}
          
          {profiles.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{profiles.join(', ')}</span>
            </div>
          )}
          
          {phases.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{phases.join(', ')}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5 mt-3">
          {references.map((reference, index) => (
            <Badge key={index} variant="outline" className="bg-gray-50 text-xs">
              {reference}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full text-xs">
          {effort && (
            <Badge className={cn("font-normal", effortColors[effort])}>
              Effort: {effort.toLowerCase()}
            </Badge>
          )}
          
          {priority && (
            <Badge className={cn("font-normal", priorityColors[priority])}>
              Priorité: {priority.toLowerCase()}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChecklistItemCard;
