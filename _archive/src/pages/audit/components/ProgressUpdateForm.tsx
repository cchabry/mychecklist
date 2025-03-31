
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, User, MessageSquare, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComplianceStatus, ActionProgress, ActionStatus } from '@/lib/types';
import { toast } from 'sonner';

interface ProgressUpdateFormProps {
  actionId: string;
  currentStatus: ActionStatus;
  onSave: (progress: Partial<ActionProgress>) => void;
  onCancel: () => void;
}

const ProgressUpdateForm: React.FC<ProgressUpdateFormProps> = ({
  actionId,
  currentStatus,
  onSave,
  onCancel
}) => {
  const [responsible, setResponsible] = useState('');
  const [comment, setComment] = useState('');
  const [score, setScore] = useState<ComplianceStatus>(ComplianceStatus.PartiallyCompliant);
  const [status, setStatus] = useState<ActionStatus>(currentStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responsible.trim()) {
      toast.error("Le responsable est requis");
      return;
    }
    
    const progress: Partial<ActionProgress> = {
      actionId,
      date: new Date().toISOString(),
      responsible: responsible.trim(),
      comment: comment.trim() || undefined,
      score,
      status
    };
    
    onSave(progress);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Ajouter un suivi de progression</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsable</Label>
            <div className="relative">
              <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="responsible"
                placeholder="Nom du responsable"
                className="pl-8"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="progress-date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="progress-date"
                value={format(new Date(), 'dd/MM/yyyy')}
                readOnly
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="progress-status">Statut</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ActionStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ActionStatus.ToDo}>À faire</SelectItem>
                <SelectItem value={ActionStatus.InProgress}>En cours</SelectItem>
                <SelectItem value={ActionStatus.Done}>Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="progress-score">Niveau de conformité atteint</Label>
            <Select
              value={score}
              onValueChange={(value) => setScore(value as ComplianceStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ComplianceStatus.NonCompliant}>Non conforme</SelectItem>
                <SelectItem value={ComplianceStatus.PartiallyCompliant}>Partiellement conforme</SelectItem>
                <SelectItem value={ComplianceStatus.Compliant}>Conforme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire</Label>
            <div className="relative">
              <MessageSquare className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="comment"
                placeholder="Détails sur les progrès réalisés"
                className="min-h-24 pl-8"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="gap-2 pt-3 border-t">
          <Button type="submit">Enregistrer</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProgressUpdateForm;
