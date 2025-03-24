
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { configureNotion, extractNotionDatabaseId } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import NotionErrorDetails from './NotionErrorDetails';
import NotionConfigForm from './NotionConfigForm';
import { isOAuthToken, isIntegrationKey } from '@/lib/notionProxy/config';

interface NotionConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NotionConfig: React.FC<NotionConfigProps> = ({ isOpen, onClose, onSuccess }) => {
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [errorContext, setErrorContext] = useState<string>('');
  
  useEffect(() => {
    if (isOpen) {
      setError('');
      setErrorContext('');
    }
  }, [isOpen]);
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Configuration Notion</DialogTitle>
            <DialogDescription>
              Connectez vos bases de données Notion pour synchroniser vos audits
            </DialogDescription>
          </DialogHeader>
          
          {notionApi.mockMode.isActive() && (
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
              <p className="text-sm text-amber-700 font-medium">
                Mode démonstration actuellement actif
              </p>
              <p className="text-xs text-amber-600 mt-1">
                En configurant Notion, vous tenterez de désactiver le mode démonstration.
              </p>
            </div>
          )}
          
          <NotionConfigForm 
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        </DialogContent>
      </Dialog>
      
      <NotionErrorDetails
        isOpen={showErrorDetails}
        onClose={() => setShowErrorDetails(false)}
        error={error}
        context={errorContext}
      />
    </>
  );
};

export default NotionConfig;
