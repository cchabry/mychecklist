
import React, { useState } from 'react';
import { CalendarIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ActionPriority, ActionStatus } from './ActionCard';

export interface ActionFormProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    exigenceId: string;
    pageId: string;
    dueDate?: Date;
    responsible?: string;
    priority: ActionPriority;
    status: ActionStatus;
    progress?: number;
  };
  exigenceTitle: string;
  pageTitle: string;
  onSave: (data: {
    title: string;
    description?: string;
    exigenceId: string;
    pageId: string;
    dueDate?: Date;
    responsible?: string;
    priority: ActionPriority;
    status: ActionStatus;
    progress?: number;
  }) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

const priorities: { value: ActionPriority; label: string }[] = [
  { value: 'BASSE', label: 'Basse' },
  { value: 'MOYENNE', label: 'Moyenne' },
  { value: 'HAUTE', label: 'Haute' },
  { value: 'CRITIQUE', label: 'Critique' },
];

const statuses: { value: ActionStatus; label: string }[] = [
  { value: 'À_FAIRE', label: 'À faire' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINÉE', label: 'Terminée' },
];

/**
 * Formulaire de création/édition d'actions correctives
 */
export const ActionForm: React.FC<ActionFormProps> = ({
  initialData,
  exigenceTitle,
  pageTitle,
  onSave,
  onCancel,
  className,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialData?.dueDate);
  const [responsible, setResponsible] = useState(initialData?.responsible || '');
  const [priority, setPriority] = useState<ActionPriority>(initialData?.priority || 'MOYENNE');
  const [status, setStatus] = useState<ActionStatus>(initialData?.status || 'À_FAIRE');
  const [progress, setProgress] = useState(initialData?.progress || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Erreur', {
        description: 'Le titre de l\'action est requis'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        exigenceId: initialData?.exigenceId || '',
        pageId: initialData?.pageId || '',
        dueDate,
        responsible: responsible.trim() || undefined,
        priority,
        status,
        progress: status === 'TERMINÉE' ? 1 : progress,
      });
      
      toast.success('Action enregistrée', {
        description: 'L\'action corrective a été sauvegardée'
      });
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de sauvegarder l\'action'
      });
      console.error('Erreur lors de la sauvegarde de l\'action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
              {initialData?.id ? 'Modifier l\'action' : 'Nouvelle action corrective'}
            </CardTitle>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={onCancel}
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titre de l'action*</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'action corrective"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée de l'action à entreprendre"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Exigence concernée</label>
              <Input
                value={exigenceTitle}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Page concernée</label>
              <Input
                value={pageTitle}
                readOnly
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Personne responsable</label>
              <Input
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nom du responsable"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date d'échéance</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? (
                      format(dueDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priorité</label>
              <Select 
                value={priority} 
                onValueChange={(val) => setPriority(val as ActionPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select 
                value={status} 
                onValueChange={(val) => {
                  setStatus(val as ActionStatus);
                  if (val === 'TERMINÉE') setProgress(1);
                  else if (val === 'À_FAIRE') setProgress(0);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {status === 'EN_COURS' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Progression</label>
                <span className="text-sm">{Math.round(progress * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={progress}
                onChange={(e) => setProgress(parseFloat(e.target.value))}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {initialData?.id ? 'Mettre à jour' : 'Créer'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ActionForm;
