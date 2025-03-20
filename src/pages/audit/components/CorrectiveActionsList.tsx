
import React from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  CorrectiveAction, 
  ActionPriority, 
  ActionStatus,
  SamplePage
} from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CorrectiveActionsListProps {
  actions: CorrectiveAction[];
  pages: SamplePage[];
  onAddAction?: () => void;
  onEditAction?: (action: CorrectiveAction) => void;
  onDeleteAction?: (actionId: string) => void;
}

const CorrectiveActionsList: React.FC<CorrectiveActionsListProps> = ({
  actions,
  pages,
  onAddAction,
  onEditAction,
  onDeleteAction
}) => {
  // Fonction pour trouver le titre de la page correspondante
  const getPageTitle = (pageId: string): string => {
    const page = pages.find(p => p.id === pageId);
    return page ? page.title : 'Page inconnue';
  };
  
  // Fonction pour formatter la date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };
  
  // Fonction pour déterminer la couleur du badge de priorité
  const getPriorityBadgeVariant = (priority: ActionPriority): "default" | "destructive" | "outline" | "secondary" => {
    switch (priority) {
      case ActionPriority.Critique:
        return "destructive";
      case ActionPriority.Haute:
        return "default";
      case ActionPriority.Moyenne:
        return "secondary";
      case ActionPriority.Faible:
        return "outline";
      default:
        return "outline";
    }
  };
  
  // Fonction pour déterminer la couleur du badge de statut
  const getStatusBadgeVariant = (status: ActionStatus): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case ActionStatus.Done:
        return "default";
      case ActionStatus.InProgress:
        return "secondary";
      case ActionStatus.ToDo:
        return "outline";
      default:
        return "outline";
    }
  };
  
  // Tri des actions par priorité et date d'échéance
  const sortedActions = [...actions].sort((a, b) => {
    // D'abord par statut (à faire, en cours, terminée)
    if (a.status !== b.status) {
      if (a.status === ActionStatus.ToDo) return -1;
      if (b.status === ActionStatus.ToDo) return 1;
      if (a.status === ActionStatus.InProgress) return -1;
      if (b.status === ActionStatus.InProgress) return 1;
    }
    
    // Ensuite par priorité
    const priorityOrder = {
      [ActionPriority.Critique]: 0,
      [ActionPriority.Haute]: 1,
      [ActionPriority.Moyenne]: 2,
      [ActionPriority.Faible]: 3,
    };
    
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Enfin par date d'échéance
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  return (
    <Card className="border border-tmw-blue/10 shadow-sm mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Actions correctives</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddAction}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle action</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 px-4 pb-4">
        {sortedActions.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">Aucune action corrective définie</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez des actions pour suivre les corrections à apporter
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="hidden md:table-cell">Responsable</TableHead>
                <TableHead className="hidden md:table-cell">Échéance</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedActions.map((action) => {
                // Vérifier si l'action est en retard
                const isOverdue = action.status !== ActionStatus.Done && 
                  new Date(action.dueDate) < new Date() &&
                  action.priority !== ActionPriority.Faible;
                
                return (
                  <TableRow key={action.id} className={isOverdue ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium">
                      {getPageTitle(action.evaluationId.split('-')[1])}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {action.responsible}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        {isOverdue && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatDate(action.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(action.priority)}>
                        {action.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusBadgeVariant(action.status)}>
                        {action.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditAction && onEditAction(action)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteAction && onDeleteAction(action.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CorrectiveActionsList;
