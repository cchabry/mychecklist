
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AlertCircle } from 'lucide-react';
import NotionErrorStatusSection from './NotionErrorStatusSection';
import NotionProxyConfigSection from './NotionProxyConfigSection';
import NotionFetchErrorSection from './NotionFetchErrorSection';
import NotionSolutionsSection from './NotionSolutionsSection';
import NotionAlternativesSection from './NotionAlternativesSection';
import NotionErrorActions from './NotionErrorActions';

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
  
  // Vérifier si c'est une erreur "Failed to fetch"
  const isFailedToFetch = error.includes('Failed to fetch');
  const isProxyMessage = error.includes('Tentative de connexion via proxy');
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center text-amber-600 gap-2 mb-2">
            <AlertCircle size={20} />
            <SheetTitle className="text-amber-600">
              {isProxyMessage ? 'Configuration du proxy Notion' : 'Limitation technique Notion'}
            </SheetTitle>
          </div>
          <SheetDescription>
            {isProxyMessage 
              ? 'Instructions pour finaliser la configuration du proxy' 
              : 'Explication du problème et des solutions possibles'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <NotionErrorStatusSection error={error} context={context} />
          
          {isProxyMessage ? (
            <NotionProxyConfigSection />
          ) : isFailedToFetch ? (
            <NotionFetchErrorSection />
          ) : (
            <NotionSolutionsSection />
          )}
          
          {isFailedToFetch && !isProxyMessage && (
            <NotionAlternativesSection />
          )}
          
          <NotionErrorActions 
            onCopyDetails={copyErrorDetails} 
            isProxyMessage={isProxyMessage} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotionErrorDetails;
