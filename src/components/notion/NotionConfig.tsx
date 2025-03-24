
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
  const [initialApiKey, setInitialApiKey] = useState<string>('');
  const [initialProjectsDbId, setInitialProjectsDbId] = useState<string>('');
  const [initialChecklistsDbId, setInitialChecklistsDbId] = useState<string>('');
  
  // Charger les valeurs sauvegardées dès que le composant est monté
  useEffect(() => {
    const savedApiKey = localStorage.getItem('notion_api_key') || '';
    const savedProjectsDbId = localStorage.getItem('notion_database_id') || '';
    const savedChecklistsDbId = localStorage.getItem('notion_checklists_database_id') || '';
    
    setInitialApiKey(savedApiKey);
    setInitialProjectsDbId(savedProjectsDbId);
    setInitialChecklistsDbId(savedChecklistsDbId);
  }, []);
  
  // Recharger les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const savedApiKey = localStorage.getItem('notion_api_key') || '';
      const savedProjectsDbId = localStorage.getItem('notion_database_id') || '';
      const savedChecklistsDbId = localStorage.getItem('notion_checklists_database_id') || '';
      
      setInitialApiKey(savedApiKey);
      setInitialProjectsDbId(savedProjectsDbId);
      setInitialChecklistsDbId(savedChecklistsDbId);
      
      console.log('📝 Modal Notion ouverte, chargement des valeurs:', {
        apiKey: savedApiKey ? `${savedApiKey.substring(0, 8)}...` : 'vide',
        projectsDbId: savedProjectsDbId || 'vide',
        checklistsDbId: savedChecklistsDbId || 'vide'
      });

      setError('');
      setErrorContext('');
    }
  }, [isOpen]);
  
  const handleFormSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };
  
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
            onSuccess={handleFormSuccess}
            onCancel={onClose}
            initialApiKey={initialApiKey}
            initialProjectsDbId={initialProjectsDbId}
            initialChecklistsDbId={initialChecklistsDbId}
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
