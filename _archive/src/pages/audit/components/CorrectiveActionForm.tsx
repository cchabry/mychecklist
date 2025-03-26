
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import { CorrectiveAction, ActionPriority, ActionStatus, ComplianceStatus, SamplePage } from '@/lib/types';

interface CorrectiveActionFormProps {
  action?: CorrectiveAction;
  pages: SamplePage[];
  onSave: (action: Partial<CorrectiveAction>) => void;
  onCancel: () => void;
}

const CorrectiveActionForm: React.FC<CorrectiveActionFormProps> = ({
  action,
  pages,
  onSave,
  onCancel
}) => {
  const [pageId, setPageId] = useState(action?.pageId || '');
  const [targetScore, setTargetScore] = useState<ComplianceStatus>(action?.targetScore || ComplianceStatus.Compliant);
  const [priority, setPriority] = useState<ActionPriority>(action?.priority || ActionPriority.Medium);
  const [dueDate, setDueDate] = useState<Date>(action ? new Date(action.dueDate) : new Date());
  const [responsible, setResponsible] = useState(action?.responsible || '');
  const [comment, setComment] = useState(action?.comment || '');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      pageId,
      targetScore,
      priority,
      dueDate: dueDate.toISOString(),
      responsible,
      comment,
      ...(action && { id: action.id, status: action.status })
    });
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page">Page concernée</Label>
            <Select value={pageId} onValueChange={setPageId} required>
              <SelectTrigger id="page">
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
            <Label htmlFor="target">Objectif</Label>
            <Select value={targetScore} onValueChange={(value) => setTargetScore(value as ComplianceStatus)}>
              <SelectTrigger id="target">
                <SelectValue placeholder="Sélectionner un objectif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ComplianceStatus.Compliant}>Conforme</SelectItem>
                <SelectItem value={ComplianceStatus.PartiallyCompliant}>Partiellement conforme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorité</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as ActionPriority)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Sélectionner une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActionPriority.Critical}>Critique</SelectItem>
                <SelectItem value={ActionPriority.High}>Haute</SelectItem>
                <SelectItem value={ActionPriority.Medium}>Moyenne</SelectItem>
                <SelectItem value={ActionPriority.Low}>Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Sélectionner une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date || new Date());
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Responsable</Label>
            <Input
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nom du responsable"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Détails de l'action corrective..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            {action ? "Mettre à jour" : "Ajouter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CorrectiveActionForm;
