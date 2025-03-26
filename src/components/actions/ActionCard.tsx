
import React from 'react';
import { Calendar, Clock, User, Flag, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatPercent } from '@/utils/format';

export type ActionPriority = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
export type ActionStatus = 'À_FAIRE' | 'EN_COURS' | 'TERMINÉE';

export interface ActionCardProps {
  id: string;
  title: string;
  description?: string;
  exigence?: string;
  page?: string;
  dueDate?: string; // ISO date string
  responsible?: string;
  priority: ActionPriority;
  status: ActionStatus;
  progress?: number; // 0 to 1
  onClick?: () => void;
  className?: string;
}

const priorityConfig = {
  'BASSE': { label: 'Basse', icon: Flag, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'MOYENNE': { label: 'Moyenne', icon: Flag, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  'HAUTE': { label: 'Haute', icon: Flag, color: 'text-orange-500', bgColor: 'bg-orange-50' },
  'CRITIQUE': { label: 'Critique', icon: Flag, color: 'text-red-500', bgColor: 'bg-red-50' },
};

const statusConfig = {
  'À_FAIRE': { label: 'À faire', icon: XCircle, color: 'text-gray-500', bgColor: 'bg-gray-50' },
  'EN_COURS': { label: 'En cours', icon: AlertCircle, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'TERMINÉE': { label: 'Terminée', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
};

/**
 * Carte pour afficher une action corrective
 */
export const ActionCard: React.FC<ActionCardProps> = ({
  id,
  title,
  description,
  exigence,
  page,
  dueDate,
  responsible,
  priority,
  status,
  progress = 0,
  onClick,
  className,
}) => {
  const priorityInfo = priorityConfig[priority];
  const statusInfo = statusConfig[status];
  const PriorityIcon = priorityInfo.icon;
  const StatusIcon = statusInfo.icon;
  
  const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : undefined;
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'TERMINÉE';
  
  return (
    <Card 
      className={cn(
        "w-full transition-shadow hover:shadow-md cursor-pointer",
        onClick && "hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <Badge 
            className={cn(
              "font-normal",
              statusInfo.bgColor,
              statusInfo.color
            )}
          >
            <StatusIcon className="h-3.5 w-3.5 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          {exigence && (
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="text-muted-foreground">Exigence:</span>
              <span className="truncate font-medium">{exigence}</span>
            </div>
          )}
          
          {page && (
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="text-muted-foreground">Page:</span>
              <span className="truncate font-medium">{page}</span>
            </div>
          )}
          
          {responsible && (
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{responsible}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                {formattedDate}
                {isOverdue && ' (en retard)'}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            <PriorityIcon className={cn("h-3.5 w-3.5", priorityInfo.color)} />
            <span className={priorityInfo.color}>{priorityInfo.label}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatPercent(progress)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Progress value={progress * 100} className="w-full" />
      </CardFooter>
    </Card>
  );
};

export default ActionCard;
