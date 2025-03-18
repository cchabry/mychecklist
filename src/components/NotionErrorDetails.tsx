
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';

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
  context
}) => {
  const copyErrorDetails = () => {
    const details = `
Erreur Notion: ${error}
Contexte: ${context || 'Non spécifié'}
Navigateur: ${navigator.userAgent}
Date: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center text-red-600 gap-2 mb-2">
            <AlertCircle size={20} />
            <SheetTitle className="text-red-600">Erreur de connexion Notion</SheetTitle>
          </div>
          <SheetDescription>
            Détails de l'erreur et suggestions pour résoudre le problème
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <h3 className="font-medium mb-2 text-red-700">Message d'erreur</h3>
            <p className="text-sm text-red-600">{error}</p>
            {context && (
              <div className="mt-2 pt-2 border-t border-red-200">
                <p className="text-xs text-red-500">Contexte: {context}</p>
              </div>
            )}
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-3">Solutions possibles</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vérifiez que votre clé API commence par "secret_" et est correctement copiée</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Assurez-vous que l'intégration a accès à la base de données (partagez la base avec l'intégration)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vérifiez l'ID de base de données dans l'URL Notion</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>Vérifiez votre connexion internet</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex gap-2"
              onClick={copyErrorDetails}
            >
              <Copy size={16} />
              Copier les détails
            </Button>
            <Button 
              className="flex gap-2 bg-tmw-teal hover:bg-tmw-teal/90"
              asChild
            >
              <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} />
                Gérer les intégrations Notion
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotionErrorDetails;
