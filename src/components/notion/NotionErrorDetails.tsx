
import React from 'react';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { KeyRound, XCircle } from 'lucide-react';

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
  // Déterminer si c'est une erreur de permission
  const isPermissionError = error.toLowerCase().includes('permission');

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            {isPermissionError ? (
              <KeyRound className="h-5 w-5 text-amber-500 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            
            <div>
              <AlertDialogTitle className={isPermissionError ? "text-amber-700" : "text-red-700"}>
                {isPermissionError ? "Erreur de permission Notion" : "Erreur Notion"}
              </AlertDialogTitle>
              
              <AlertDialogDescription className="mt-2 text-sm">
                <span className="font-medium">{error}</span>
                
                {context && (
                  <p className="mt-2 text-muted-foreground text-xs">
                    {context}
                  </p>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotionErrorDetails;
