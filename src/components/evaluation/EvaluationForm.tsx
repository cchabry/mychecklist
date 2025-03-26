
import React, { useState } from 'react';
import { Paperclip, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ScoreSelector, ComplianceScore } from './ScoreSelector';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface EvaluationFormProps {
  exigenceId: string;
  pageId: string;
  initialData?: {
    score: ComplianceScore;
    comment?: string;
    attachments?: Attachment[];
  };
  onSave: (data: {
    exigenceId: string;
    pageId: string;
    score: ComplianceScore;
    comment?: string;
    attachments?: Attachment[];
  }) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

/**
 * Formulaire d'évaluation pour noter la conformité d'une page à une exigence
 */
export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  exigenceId,
  pageId,
  initialData,
  onSave,
  onCancel,
  className,
}) => {
  const [score, setScore] = useState<ComplianceScore>(initialData?.score || 'NA');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [attachments, setAttachments] = useState<Attachment[]>(initialData?.attachments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Cette fonction serait implémentée plus tard avec la gestion de fichiers
  const handleFileUpload = () => {
    // Simulons l'ajout d'une pièce jointe pour la démonstration
    const mockAttachment: Attachment = {
      id: Date.now().toString(),
      name: 'capture_ecran.png',
      url: '#',
      type: 'image/png'
    };
    
    setAttachments([...attachments, mockAttachment]);
    toast.info('Pièce jointe ajoutée');
  };
  
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        exigenceId,
        pageId,
        score,
        comment: comment.trim() || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });
      
      toast.success('Évaluation enregistrée', {
        description: 'Les modifications ont été sauvegardées'
      });
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de sauvegarder l\'évaluation'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">Évaluation</CardTitle>
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
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Niveau de conformité</label>
            <ScoreSelector 
              value={score} 
              onChange={setScore} 
              disabled={isSubmitting} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Commentaire d'évaluation</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajoutez un commentaire ou des observations..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Pièces jointes</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFileUpload}
                disabled={isSubmitting}
              >
                <Paperclip className="h-3.5 w-3.5 mr-1" />
                Ajouter
              </Button>
            </div>
            
            {attachments.length > 0 ? (
              <div className="bg-muted p-2 rounded-md">
                <ul className="space-y-1">
                  {attachments.map((attachment) => (
                    <li 
                      key={attachment.id}
                      className="flex items-center justify-between text-sm p-1 hover:bg-accent rounded"
                    >
                      <span className="truncate max-w-[200px]">{attachment.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeAttachment(attachment.id)}
                        disabled={isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic p-2">
                Aucune pièce jointe
              </div>
            )}
          </div>
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
            Enregistrer
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EvaluationForm;
