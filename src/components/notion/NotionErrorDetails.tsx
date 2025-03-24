
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface NotionErrorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  context?: string;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({
  isOpen,
  onClose,
  error,
  context = 'Opération Notion'
}) => {
  if (!error) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Erreur Notion
          </DialogTitle>
          <DialogDescription>
            Une erreur s'est produite lors de l'opération avec Notion
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Contexte</h4>
            <p className="text-sm text-muted-foreground">{context}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Message d'erreur</h4>
            <div className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
              {error}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Résolutions possibles</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Vérifiez que votre clé API Notion est valide</li>
              <li>Assurez-vous que l'intégration a accès à la base de données</li>
              <li>Vérifiez votre connexion Internet</li>
              <li>Si le problème persiste, essayez d'activer le mode démo</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotionErrorDetails;
