
import React, { useState } from 'react';
import { Save, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type ImportanceLevel = 'N/A' | 'MINEUR' | 'MOYEN' | 'IMPORTANT' | 'MAJEUR';

export type ExigenceEditorProps = {
  initialData?: {
    itemId: string;
    importance: ImportanceLevel;
    comment?: string;
  };
  checklistItem: {
    id: string;
    consigne: string;
    description?: string;
    category?: string;
    subcategory?: string;
    references?: string[];
  };
  onSave: (data: { itemId: string; importance: ImportanceLevel; comment?: string }) => void;
  onCancel: () => void;
  className?: string;
};

const importanceLevels: { value: ImportanceLevel; label: string; color: string }[] = [
  { value: 'N/A', label: 'Non applicable', color: 'bg-gray-300 text-gray-800' },
  { value: 'MINEUR', label: 'Mineur', color: 'bg-blue-100 text-blue-800' },
  { value: 'MOYEN', label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'IMPORTANT', label: 'Important', color: 'bg-orange-100 text-orange-800' },
  { value: 'MAJEUR', label: 'Majeur', color: 'bg-red-100 text-red-800' },
];

/**
 * Éditeur d'exigences pour personnaliser les items de checklist pour un projet
 */
export const ExigenceEditor = ({
  initialData,
  checklistItem,
  onSave,
  onCancel,
  className,
}: ExigenceEditorProps) => {
  const [importance, setImportance] = useState<ImportanceLevel>(initialData?.importance || 'N/A');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        itemId: checklistItem.id,
        importance,
        comment: comment.trim() || undefined,
      });
      
      toast.success('Exigence mise à jour', {
        description: 'Les modifications ont été enregistrées'
      });
    } catch (error) {
      toast.error('Erreur', {
        description: 'Impossible de sauvegarder l\'exigence'
      });
      console.error('Erreur lors de la sauvegarde de l\'exigence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{checklistItem.consigne}</CardTitle>
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
          
          {checklistItem.category && checklistItem.subcategory && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-muted/50">
                {checklistItem.category}
              </Badge>
              <Badge variant="outline" className="bg-muted/50">
                {checklistItem.subcategory}
              </Badge>
            </div>
          )}
          
          {checklistItem.description && (
            <div className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md flex gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{checklistItem.description}</p>
            </div>
          )}
          
          {checklistItem.references && checklistItem.references.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {checklistItem.references.map((ref, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {ref}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Niveau d'importance</label>
            <Select 
              value={importance} 
              onValueChange={(val) => setImportance(val as ImportanceLevel)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau d'importance" />
              </SelectTrigger>
              <SelectContent>
                {importanceLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", level.color.split(' ')[0])} />
                      {level.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Commentaire spécifique au projet</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ajoutez un commentaire ou des précisions spécifiques à ce projet..."
              rows={4}
            />
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

export default ExigenceEditor;
