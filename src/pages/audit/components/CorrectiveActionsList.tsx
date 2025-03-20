
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CornerDownRight, Edit, Plus, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CorrectiveAction, SamplePage } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>("medium");
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() + 1))
  );
  const [responsible, setResponsible] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  
  const handleAddAction = () => {
    if (!selectedPage) {
      toast.error("Veuillez sélectionner une page");
      return;
    }
    
    const newAction: Partial<CorrectiveAction> = {
      pageId: selectedPage,
      priority: selectedPriority as "low" | "medium" | "high" | "critical",
      dueDate: selectedDueDate?.toISOString() || new Date().toISOString(),
      responsible: responsible || "Non assigné",
      comment: comment || "Action à réaliser",
      status: "todo"
    };
    
    onAddAction(newAction);
    resetForm();
    setIsAddingAction(false);
    
    toast.success("Action corrective ajoutée");
  };
  
  const resetForm = () => {
    setSelectedPage(null);
    setSelectedPriority("medium");
    setSelectedDueDate(new Date(new Date().setMonth(new Date().getMonth() + 1)));
    setResponsible("");
    setComment("");
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-700 bg-red-100 border-red-300";
      case "high":
        return "text-orange-700 bg-orange-100 border-orange-300";
      case "medium":
        return "text-amber-700 bg-amber-100 border-amber-300";
      case "low":
        return "text-green-700 bg-green-100 border-green-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-700 bg-green-100 border-green-300";
      case "in-progress":
        return "text-blue-700 bg-blue-100 border-blue-300";
      case "todo":
        return "text-gray-700 bg-gray-100 border-gray-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };
  
  const getPageNameById = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    return page ? page.title : `Page ${pageId}`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Actions correctives ({actions.length})</h3>
        <Button 
          onClick={() => setIsAddingAction(!isAddingAction)} 
          variant={isAddingAction ? "secondary" : "default"}
          size="sm"
        >
          {isAddingAction ? "Annuler" : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle action
            </>
          )}
        </Button>
      </div>
      
      {isAddingAction && (
        <Card className="mb-4 border-dashed border-2 border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nouvelle action corrective</CardTitle>
            <CardDescription>Définir les caractéristiques de l'action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page concernée</label>
                <Select value={selectedPage || ""} onValueChange={setSelectedPage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map(page => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priorité</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date d'échéance</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {selectedDueDate ? format(selectedDueDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDueDate}
                      onSelect={setSelectedDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Responsable</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Nom du responsable"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaire</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Description de l'action corrective à réaliser"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddAction} className="w-full">
              Ajouter cette action
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {actions.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50 text-gray-500">
          <p>Aucune action corrective définie</p>
          <Button 
            variant="link" 
            onClick={() => setIsAddingAction(true)} 
            className="mt-2"
          >
            Ajouter une première action
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map(action => (
            <Card key={action.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-primary/5 flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <Badge variant="outline" className={getPriorityColor(action.priority)}>
                      {action.priority === "critical" ? "Critique" : 
                       action.priority === "high" ? "Haute" : 
                       action.priority === "medium" ? "Moyenne" : "Faible"}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(action.status)}>
                      {action.status === "done" ? "Terminé" : 
                       action.status === "in-progress" ? "En cours" : "À faire"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-medium">
                    {action.comment}
                  </CardTitle>
                </div>
                
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => onEditAction(action)}>
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette action ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action sera définitivement supprimée du plan d'action.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          onDeleteAction(action.id);
                          toast.success("Action supprimée");
                        }}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              
              <CardContent className="py-3 px-4">
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div>
                    <p className="text-muted-foreground">Page concernée</p>
                    <p className="font-medium">{getPageNameById(action.pageId)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Responsable</p>
                    <p className="font-medium">{action.responsible || "Non assigné"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date d'échéance</p>
                    <p className="font-medium">
                      {action.dueDate ? format(new Date(action.dueDate), 'PPP', { locale: fr }) : "Non définie"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dernière mise à jour</p>
                    <p className="font-medium">
                      {action.updatedAt ? format(new Date(action.updatedAt), 'PPP', { locale: fr }) : "Jamais"}
                    </p>
                  </div>
                </div>
                
                {action.progress && action.progress.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">Suivi des modifications</p>
                    <div className="space-y-2">
                      {action.progress.map((progress, index) => (
                        <div key={index} className="text-sm flex items-start gap-2">
                          <CornerDownRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">
                              {progress.date ? format(new Date(progress.date), 'PPP', { locale: fr }) : "Date inconnue"} 
                              {progress.responsible ? ` par ${progress.responsible}` : ""}
                            </p>
                            <p>{progress.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorrectiveActionsList;
