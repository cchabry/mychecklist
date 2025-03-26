
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Calendar, CheckCircle, Clock, Filter, Search, User } from 'lucide-react';
import { Audit, CorrectiveAction, ActionPriority, ActionStatus, SamplePage, ActionProgress } from '@/lib/types';
import { CorrectiveActionDetails } from '.';
import ProgressUpdateForm from './ProgressUpdateForm';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface ActionPlanProps {
  audit: Audit;
  pages: SamplePage[];
  onActionUpdate: (updatedAction: CorrectiveAction) => void;
}

const ActionPlan: React.FC<ActionPlanProps> = ({ audit, pages, onActionUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUpdateForm, setShowUpdateForm] = useState<string | null>(null);
  
  // Extraire toutes les actions correctives de tous les items d'audit
  const allActions = useMemo(() => {
    if (!audit || !audit.items) return [];
    
    return audit.items.reduce((actions: CorrectiveAction[], item) => {
      if (item.actions && item.actions.length > 0) {
        return [...actions, ...item.actions];
      }
      return actions;
    }, []);
  }, [audit]);
  
  // Filtrer les actions selon les critères
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      // Filtre de recherche
      const matchesSearch = searchTerm === '' || 
        action.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (action.comment && action.comment.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtre de priorité
      const matchesPriority = priorityFilter === 'all' || action.priority === priorityFilter;
      
      // Filtre de statut
      const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [allActions, searchTerm, priorityFilter, statusFilter]);
  
  // Grouper les actions par statut
  const actionsByStatus = useMemo(() => {
    const grouped = {
      [ActionStatus.ToDo]: [] as CorrectiveAction[],
      [ActionStatus.InProgress]: [] as CorrectiveAction[],
      [ActionStatus.Done]: [] as CorrectiveAction[]
    };
    
    filteredActions.forEach(action => {
      grouped[action.status].push(action);
    });
    
    return grouped;
  }, [filteredActions]);
  
  // Gestionnaire pour l'édition d'une action
  const handleEditAction = (action: CorrectiveAction) => {
    // À implémenter dans une version future
    toast.info("Fonctionnalité d'édition à venir", {
      description: "Cette fonctionnalité sera disponible dans une prochaine version."
    });
  };
  
  // Gestionnaire pour la suppression d'une action
  const handleDeleteAction = (actionId: string) => {
    // À implémenter dans une version future
    toast.info("Fonctionnalité de suppression à venir", {
      description: "Cette fonctionnalité sera disponible dans une prochaine version."
    });
  };
  
  // Gestionnaire pour ajouter un suivi de progression
  const handleAddProgress = (actionId: string) => {
    setShowUpdateForm(actionId);
  };
  
  // Gestionnaire pour sauvegarder un suivi de progression
  const handleSaveProgress = (actionId: string, progressData: Partial<ActionProgress>) => {
    const action = allActions.find(a => a.id === actionId);
    if (!action) return;
    
    // Créer un nouvel objet de progression
    const newProgress: ActionProgress = {
      id: uuidv4(),
      ...progressData as Omit<ActionProgress, 'id'>
    };
    
    // Mettre à jour l'action avec la nouvelle progression
    const updatedAction: CorrectiveAction = {
      ...action,
      status: progressData.status || action.status,
      updatedAt: new Date().toISOString(),
      progress: [...(action.progress || []), newProgress]
    };
    
    // Appeler la fonction de mise à jour
    onActionUpdate(updatedAction);
    setShowUpdateForm(null);
    
    toast.success("Suivi de progression ajouté", {
      description: "Le suivi a été enregistré avec succès."
    });
  };
  
  // Marquer une action comme terminée
  const handleCompleteAction = (actionId: string) => {
    const action = allActions.find(a => a.id === actionId);
    if (!action) return;
    
    // Mettre à jour le statut de l'action
    const updatedAction: CorrectiveAction = {
      ...action,
      status: ActionStatus.Done,
      updatedAt: new Date().toISOString()
    };
    
    // Appeler la fonction de mise à jour
    onActionUpdate(updatedAction);
    
    toast.success("Action marquée comme terminée", {
      description: "Le statut de l'action a été mis à jour."
    });
  };
  
  if (allActions.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucune action corrective</h3>
        <p className="text-muted-foreground">
          Aucune action corrective n'a été définie pour cet audit.
          <br />
          Vous pouvez ajouter des actions dans l'onglet "Actions correctives" de chaque critère.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Plan d'action ({allActions.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{actionsByStatus[ActionStatus.ToDo].length} à faire</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <Clock className="h-3 w-3" />
                <span>{actionsByStatus[ActionStatus.InProgress].length} en cours</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <CheckCircle className="h-3 w-3" />
                <span>{actionsByStatus[ActionStatus.Done].length} terminées</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une action..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-40">
                <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="pl-8">
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les priorités</SelectItem>
                    <SelectItem value={ActionPriority.Critical}>Critique</SelectItem>
                    <SelectItem value={ActionPriority.High}>Haute</SelectItem>
                    <SelectItem value={ActionPriority.Medium}>Moyenne</SelectItem>
                    <SelectItem value={ActionPriority.Low}>Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-40">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value={ActionStatus.ToDo}>À faire</SelectItem>
                    <SelectItem value={ActionStatus.InProgress}>En cours</SelectItem>
                    <SelectItem value={ActionStatus.Done}>Terminé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue={ActionStatus.ToDo}>
            <TabsList className="mb-4">
              <TabsTrigger value={ActionStatus.ToDo} className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                À faire ({actionsByStatus[ActionStatus.ToDo].length})
              </TabsTrigger>
              <TabsTrigger value={ActionStatus.InProgress} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                En cours ({actionsByStatus[ActionStatus.InProgress].length})
              </TabsTrigger>
              <TabsTrigger value={ActionStatus.Done} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Terminées ({actionsByStatus[ActionStatus.Done].length})
              </TabsTrigger>
            </TabsList>
            
            {Object.entries(actionsByStatus).map(([status, actions]) => (
              <TabsContent key={status} value={status} className="space-y-4">
                {actions.length === 0 ? (
                  <div className="text-center p-4 bg-gray-50 rounded border">
                    <p className="text-muted-foreground">Aucune action corrective avec ce statut.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {actions.map(action => (
                      <div key={action.id}>
                        {showUpdateForm === action.id ? (
                          <ProgressUpdateForm 
                            actionId={action.id}
                            currentStatus={action.status}
                            onSave={(progressData) => handleSaveProgress(action.id, progressData)}
                            onCancel={() => setShowUpdateForm(null)}
                          />
                        ) : (
                          <CorrectiveActionDetails
                            action={action}
                            pages={pages}
                            onEdit={() => handleEditAction(action)}
                            onDelete={() => handleDeleteAction(action.id)}
                            onAddProgress={
                              action.status !== ActionStatus.Done 
                                ? () => handleAddProgress(action.id) 
                                : undefined
                            }
                            onComplete={
                              action.status !== ActionStatus.Done 
                                ? () => handleCompleteAction(action.id) 
                                : undefined
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionPlan;
