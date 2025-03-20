
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { NotionSolutionsSection } from './index';
import { ErrorHeader, ErrorDiagnostics, ErrorActions } from './error';

interface NotionErrorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  context?: string;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({ isOpen, onClose, error, context }) => {
  // Détecter le type d'erreur
  const isJsonParseError = error?.includes('JSON.parse');
  const isCorsError = error?.includes('CORS') || error?.includes('network');
  const isPermissionError = error?.includes('403') || error?.includes('permission');
  const isAuthError = error?.includes('401') || error?.includes('auth');
  
  const handleTestSuccess = () => {
    // Fermer le dialogue après un test réussi
    onClose();
    // Recharger la page
    setTimeout(() => window.location.reload(), 1000);
  };
  
  // Si pas d'erreur, ne pas afficher le dialogue
  if (!error && !isOpen) return null;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <ErrorHeader 
            error={error} 
            context={context} 
            isPermissionError={isPermissionError} 
          />
          
          <div className="mt-6 mb-2">
            <NotionSolutionsSection 
              showCorsProxy={isCorsError}
              showMockMode={true}
              showApiKey={isAuthError}
            />
          </div>
          
          <ErrorDiagnostics onTestSuccess={handleTestSuccess} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <ErrorActions onClose={onClose} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotionErrorDetails;
