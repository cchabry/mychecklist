
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Copy } from 'lucide-react';

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
  const copyToClipboard = () => {
    const text = `Error: ${error}\n\nContext: ${context || 'N/A'}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Détails de l'erreur Notion
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            <div className="mt-2 mb-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Message :</h3>
                <div className="bg-gray-50 p-2 rounded border text-sm">{error}</div>
              </div>

              {context && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Contexte :</h3>
                  <pre className="bg-gray-50 p-2 rounded border text-xs whitespace-pre-wrap overflow-x-auto">
                    {context}
                  </pre>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier
          </Button>
          <AlertDialogAction>Fermer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotionErrorDetails;
