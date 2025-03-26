
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, AlertTriangle } from 'lucide-react';

import { CorrectiveAction, ActionPriority, ActionStatus, ComplianceStatus, SamplePage } from '@/lib/types';
import CorrectiveActionForm from './CorrectiveActionForm';
import CorrectiveActionDetails from './CorrectiveActionDetails';

interface CorrectiveActionsListProps {
  actions: CorrectiveAction[];
  pages: SamplePage[];
  onAddAction: (action: Partial<CorrectiveAction>) => void;
  onEditAction: (action: CorrectiveAction) => void;
  onDeleteAction: (actionId: string) => void;
}

const CorrectiveActionsList: React.FC<CorrectiveActionsListProps> = ({
  actions,
  pages,
  onAddAction,
  onEditAction,
  onDeleteAction
}) => {
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);
  const [addingProgressTo, setAddingProgressTo] = useState<string | null>(null);
  const [completingAction, setCompletingAction] = useState<string | null>(null);
  const [progressComment, setProgressComment] = useState('');
  const [progressResponsible, setProgressResponsible] = useState('');
  const [completionComment, setCompletionComment] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'inprogress' | 'completed'>('all');

  // Filtrer les actions selon l'onglet actif
  const filteredActions = () => {
    switch (activeTab) {
      case 'todo':
        return actions.filter(action => action.status === ActionStatus.ToDo);
      case 'inprogress':
        return actions.filter(action => action.status === ActionStatus.InProgress);
      case 'completed':
        return actions.filter(action => action.status === ActionStatus.Done);
      default:
        return actions;
    }
  };

  // Fonctions pour les dialogues
  const handleAddProgressSubmit = () => {
    if (!addingProgressTo) return;
    
    const action = actions.find(a => a.id === addingProgressTo);
    if (!action) return;
    
    const updatedAction: CorrectiveAction = {
      ...action,
      status: ActionStatus.InProgress,
      updatedAt: new Date().toISOString(),
      progress: [
        ...(action.progress || []),
        {
          id: Date.now().toString(),
          actionId: action.id,
          date: new Date().toISOString(),
          responsible: progressResponsible,
          comment: progressComment,
          score: action.targetScore,
          status: ActionStatus.InProgress
        }
      ]
    };
    
    onEditAction(updatedAction);
    setAddingProgressTo(null);
    setProgressComment('');
    setProgressResponsible('');
  };

  const handleCompletionSubmit = () => {
    if (!completingAction) return;
    
    const action = actions.find(a => a.id === completingAction);
    if (!action) return;
    
    const updatedAction: CorrectiveAction = {
      ...action,
      status: ActionStatus.Done,
      updatedAt: new Date().toISOString(),
      progress: [
        ...(action.progress || []),
        {
          id: Date.now().toString(),
          actionId: action.id,
          date: new Date().toISOString(),
          responsible: action.responsible,
          comment: completionComment,
          score: action.targetScore,
          status: ActionStatus.Done
        }
      ]
    };
    
    onEditAction(updatedAction);
    setCompletingAction(null);
    setCompletionComment('');
  };

  const handleSaveAction = (actionData: Partial<CorrectiveAction>) => {
    if (editingAction) {
      onEditAction({
        ...editingAction,
        ...actionData,
        updatedAt: new Date().toISOString()
      });
      setEditingAction(null);
    } else {
      onAddAction(actionData);
    }
    setIsAddingAction(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Actions correctives</h3>
        <Button 
          onClick={() => setIsAddingAction(true)} 
          variant="outline" 
          size="sm" 
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Ajouter une action
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="todo">À faire</TabsTrigger>
          <TabsTrigger value="inprogress">En cours</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredActions().length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50 text-gray-500">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-amber-500" />
              <p>Aucune action corrective {
                activeTab === 'all' ? '' :
                activeTab === 'todo' ? 'à faire' :
                activeTab === 'inprogress' ? 'en cours' : 'terminée'
              }</p>
            </div>
          ) : (
            filteredActions().map(action => (
              <CorrectiveActionDetails
                key={action.id}
                action={action}
                pages={pages}
                onEdit={() => setEditingAction(action)}
                onDelete={() => onDeleteAction(action.id)}
                onAddProgress={action.status !== ActionStatus.Done ? () => setAddingProgressTo(action.id) : undefined}
                onComplete={action.status !== ActionStatus.Done ? () => setCompletingAction(action.id) : undefined}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog pour ajouter/modifier une action */}
      <Dialog open={isAddingAction || !!editingAction} onOpenChange={(open) => {
        if (!open) {
          setIsAddingAction(false);
          setEditingAction(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAction ? "Modifier l'action corrective" : "Ajouter une action corrective"}
            </DialogTitle>
          </DialogHeader>
          <CorrectiveActionForm
            action={editingAction || undefined}
            pages={pages}
            onSave={handleSaveAction}
            onCancel={() => {
              setIsAddingAction(false);
              setEditingAction(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un suivi de progression */}
      <Dialog open={!!addingProgressTo} onOpenChange={(open) => {
        if (!open) setAddingProgressTo(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un suivi de progression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Responsable</label>
              <Input
                value={progressResponsible}
                onChange={(e) => setProgressResponsible(e.target.value)}
                placeholder="Nom du responsable"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commentaire</label>
              <Textarea
                value={progressComment}
                onChange={(e) => setProgressComment(e.target.value)}
                placeholder="Détails de l'avancement..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAddingProgressTo(null)}>
                Annuler
              </Button>
              <Button onClick={handleAddProgressSubmit}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour marquer une action comme terminée */}
      <Dialog open={!!completingAction} onOpenChange={(open) => {
        if (!open) setCompletingAction(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marquer comme terminé</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Commentaire de clôture</label>
              <Textarea
                value={completionComment}
                onChange={(e) => setCompletionComment(e.target.value)}
                placeholder="Détails sur la résolution..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCompletingAction(null)}>
                Annuler
              </Button>
              <Button onClick={handleCompletionSubmit}>
                Terminer l'action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CorrectiveActionsList;
