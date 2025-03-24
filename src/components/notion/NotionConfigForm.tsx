
import React, { useState, useEffect } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { getNotionConfig } from '@/lib/notion';
import {
  NotionApiKeyField,
  NotionDatabaseField,
  NotionIntegrationGuide,
  NotionFormActions,
  NotionConnectionTests,
  NotionLastSavedInfo
} from './form';

interface NotionConfigFormProps {
  onSubmit: (apiKey: string, projectsDbId: string, checklistsDbId: string) => void;
  onCancel: () => void;
  initialApiKey?: string;
  initialProjectsDbId?: string;
  initialChecklistsDbId?: string;
}

const NotionConfigForm: React.FC<NotionConfigFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialApiKey = '', 
  initialProjectsDbId = '',
  initialChecklistsDbId = ''
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [projectsDbId, setProjectsDbId] = useState(initialProjectsDbId);
  const [checklistsDbId, setChecklistsDbId] = useState(initialChecklistsDbId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  // Charger la date de dernière sauvegarde et s'assurer que les champs sont bien remplis
  useEffect(() => {
    const { lastConfigDate, apiKey: savedApiKey, databaseId: savedProjectsDbId, checklistsDbId: savedChecklistsDbId } = getNotionConfig();
    
    // S'assurer que les champs sont remplis avec les valeurs du localStorage si disponibles
    if (savedApiKey && (!apiKey || apiKey !== savedApiKey)) {
      setApiKey(savedApiKey);
    }
    
    if (savedProjectsDbId && (!projectsDbId || projectsDbId !== savedProjectsDbId)) {
      setProjectsDbId(savedProjectsDbId);
    }
    
    if (savedChecklistsDbId && (!checklistsDbId || checklistsDbId !== savedChecklistsDbId)) {
      setChecklistsDbId(savedChecklistsDbId);
    }
    
    if (lastConfigDate) {
      try {
        const date = new Date(lastConfigDate);
        setLastSaved(date.toLocaleString());
      } catch (e) {
        console.error('Erreur de format de date:', e);
      }
    }
  }, [apiKey, projectsDbId, checklistsDbId]);
  
  // Déterminer si les tests de connexion peuvent être affichés
  const storedApiKey = localStorage.getItem('notion_api_key');
  const storedDbId = localStorage.getItem('notion_database_id');
  
  const canShowTests = (apiKey && projectsDbId) || (storedApiKey && storedDbId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Soumettre après un court délai pour montrer l'état de loading
    setTimeout(() => {
      onSubmit(apiKey.trim(), projectsDbId.trim(), checklistsDbId.trim());
      setIsSubmitting(false);
    }, 500);
  };
  
  const resetMockMode = () => {
    // Utiliser forceReset au lieu de reset
    notionApi.mockMode.forceReset();
    // Réinitialiser les champs du formulaire après la réinitialisation du mode mock
    setApiKey('');
    setProjectsDbId('');
    setChecklistsDbId('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <NotionLastSavedInfo lastSaved={lastSaved} />
      
      <NotionApiKeyField 
        apiKey={apiKey} 
        onChange={setApiKey} 
      />
      
      <NotionDatabaseField 
        id="projectsDbId"
        label="ID de la base de données Projets"
        value={projectsDbId}
        onChange={setProjectsDbId}
        description="URL ou ID de votre base de données Notion contenant les projets"
      />
      
      <NotionDatabaseField 
        id="checklistsDbId"
        label="ID de la base de données Checklists"
        value={checklistsDbId}
        onChange={setChecklistsDbId}
        description="URL ou ID de votre base de données Notion contenant les checklists d'audit"
      />
      
      <NotionIntegrationGuide />
      
      {canShowTests && (
        <NotionConnectionTests 
          onSuccess={() => {
            // Rafraîchir la page après un test réussi
            setTimeout(() => window.location.reload(), 1000);
          }} 
        />
      )}
      
      <NotionFormActions 
        onCancel={onCancel}
        onReset={resetMockMode}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};

export default NotionConfigForm;
