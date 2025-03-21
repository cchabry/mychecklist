
import React from 'react';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ErrorHeader } from './error';

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
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <ErrorHeader 
          error={error} 
          context={context} 
          isPermissionError={error.toLowerCase().includes('permission')}
          isOpen={isOpen}
          onClose={onClose}
        />
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotionErrorDetails;
