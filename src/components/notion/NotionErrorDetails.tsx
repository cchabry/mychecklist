
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AlertCircle, FileCode } from 'lucide-react';
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
URL: ${window.location.href}
Date: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };
  
  // Analyser le type d'erreur
  const isFailedToFetch = error.includes('Failed to fetch');
  const isProxyMessage = error.includes('Tentative de connexion via proxy') || 
                         error.includes('404') || 
                         error.includes('proxy') ||
                         error.includes('introuvable');
  
  // Déterminer s'il s'agit d'une erreur 404 spécifique au proxy
  const isProxy404Error = error.includes('404') && error.includes('proxy');
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center text-amber-600 gap-2 mb-2">
            {isProxy404Error ? (
              <FileCode size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <SheetTitle className="text-amber-600">
              {isProxy404Error 
                ? 'Fichier API manquant' 
                : isProxyMessage 
                  ? 'Configuration du proxy Notion' 
                  : 'Limitation technique Notion'}
            </SheetTitle>
          </div>
          <SheetDescription>
            {isProxy404Error 
              ? 'Le fichier api/notion-proxy.ts est introuvable sur le serveur' 
              : isProxyMessage 
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
