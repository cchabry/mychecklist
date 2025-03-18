
import React from 'react';
import { XCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import NotionSolutionsSection from './NotionSolutionsSection';

interface NotionErrorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  context?: string;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({ isOpen, onClose, error, context }) => {
  const isJsonParseError = error?.includes('JSON.parse');
  const isCorsError = error?.includes('CORS') || error?.includes('network');
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle size={18} />
            Erreur de connexion à Notion
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mt-1 text-amber-600 font-medium flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            
            {context && (
              <div className="mt-2 text-gray-600 flex items-start gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5" /> 
                <span>{context}</span>
              </div>
            )}
            
            <div className="mt-6 mb-2">
              <NotionSolutionsSection 
                showCorsProxy={true}
                showMockMode={true}
                showApiKey={true}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                window.open('https://github.com/cedcoss-upasana/my-checklist/issues', '_blank');
              }}
              className="gap-1 text-xs"
            >
              <ExternalLink size={12} />
              Signaler un bug
            </Button>
          </div>
          <AlertDialogAction>Fermer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotionErrorDetails;
