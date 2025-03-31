
import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Flag, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CorrectiveAction, ActionPriority, ActionStatus, ComplianceStatus, SamplePage } from '@/lib/types';

interface CorrectiveActionDetailsProps {
  action: CorrectiveAction;
  pages: SamplePage[];
  onEdit: () => void;
  onDelete: () => void;
  onAddProgress?: () => void;
  onComplete?: () => void;
}

const CorrectiveActionDetails: React.FC<CorrectiveActionDetailsProps> = ({
  action,
  pages,
  onEdit,
  onDelete,
  onAddProgress,
  onComplete
}) => {
  const getPriorityColor = (priority: ActionPriority) => {
    switch (priority) {
      case ActionPriority.Critical:
        return 'bg-red-100 text-red-800 border-red-200';
      case ActionPriority.High:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ActionPriority.Medium:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case ActionPriority.Low:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.Done:
        return 'bg-green-100 text-green-800 border-green-200';
      case ActionStatus.InProgress:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ActionStatus.ToDo:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case ActionStatus.Done:
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case ActionStatus.InProgress:
        return <Clock className="h-4 w-4 mr-1" />;
      case ActionStatus.ToDo:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
  };

  const pageName = pages.find(p => p.id === action.pageId)?.title || 'Page inconnue';
  const formattedDueDate = format(new Date(action.dueDate), 'dd/MM/yyyy');
  const isCompleted = action.status === ActionStatus.Done;
  const isInProgress = action.status === ActionStatus.InProgress;

  return (
    <Card className="mb-4 overflow-hidden border">
      <CardContent className="p-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor(action.priority)}>
              <Flag className="h-3 w-3 mr-1" /> {action.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(action.status)}>
              {getStatusIcon(action.status)} {action.status}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" /> Échéance: {formattedDueDate}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="font-medium mb-1">Page concernée</h4>
          <p className="text-sm text-muted-foreground">{pageName}</p>
        </div>

        <div className="mb-3">
          <h4 className="font-medium mb-1">Responsable</h4>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-1" />
            {action.responsible}
          </div>
        </div>

        {action.comment && (
          <div className="mb-3">
            <h4 className="font-medium mb-1">Commentaire</h4>
            <p className="text-sm text-muted-foreground">{action.comment}</p>
          </div>
        )}

        {action.progress && action.progress.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Suivi de progression</h4>
            <div className="space-y-2">
              {action.progress.map((progress, index) => (
                <div key={progress.id} className="text-sm p-2 bg-gray-50 rounded border">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{progress.responsible}</span>
                    <span className="text-xs text-gray-500">{format(new Date(progress.date), 'dd/MM/yyyy')}</span>
                  </div>
                  <p className="text-muted-foreground">{progress.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 bg-gray-50 border-t flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Modifier
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={onDelete}>
          <X className="h-4 w-4 mr-1" /> Supprimer
        </Button>
        
        {!isCompleted && onAddProgress && (
          <Button size="sm" variant="outline" className="ml-auto" onClick={onAddProgress}>
            Ajouter un suivi
          </Button>
        )}
        
        {!isCompleted && onComplete && (
          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={onComplete}>
            <CheckCircle className="h-4 w-4 mr-1" /> Marquer comme terminé
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CorrectiveActionDetails;
