
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
// Correction des imports:
import NotionApiKeyField from '@/components/notion/form/NotionApiKeyField';
import NotionDatabaseField from '@/components/notion/form/NotionDatabaseField';
import NotionConnectionTests from '@/components/notion/form/NotionConnectionTests';
import NotionFormActions from '@/components/notion/form/NotionFormActions';
import { useNotion } from '@/contexts/NotionContext';
import { useNotionStorage } from '@/hooks/notion/useNotionStorage';
import { operationMode } from '@/services/operationMode';
import OperationModeStatus from '@/components/OperationModeStatus';
import { useOperationMode } from '@/services/operationMode';

interface NotionConfigFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const NotionConfigForm: React.FC<NotionConfigFormProps> = ({
  onSuccess,
  onCancel
}) => {
  // Hooks pour accéder aux données et fonctions
  const { status, testConnection } = useNotion();
  const notionStorage = useNotionStorage();
  const { enableRealMode } = useOperationMode();
  
  // État local pour les champs du formulaire
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [additionalDatabases, setAdditionalDatabases] = useState({
    checklists: '',
    projects: '',
    audits: '',
    exigences: '',
    samplePages: '',
    evaluations: '',
    actions: ''
  });
  
  // Charger les valeurs sauvegardées au démarrage
  useEffect(() => {
    const config = notionStorage.getStoredConfig();
    if (config.apiKey) setApiKey(config.apiKey);
    if (config.databaseId) setDatabaseId(config.databaseId);
    
    // Charger les bases de données additionnelles
    if (config.checklistsDbId) setAdditionalDatabases(prev => ({ ...prev, checklists: config.checklistsDbId || '' }));
    if (config.projectsDbId) setAdditionalDatabases(prev => ({ ...prev, projects: config.projectsDbId || '' }));
    if (config.auditsDbId) setAdditionalDatabases(prev => ({ ...prev, audits: config.auditsDbId || '' }));
    if (config.exigencesDbId) setAdditionalDatabases(prev => ({ ...prev, exigences: config.exigencesDbId || '' }));
    if (config.samplePagesDbId) setAdditionalDatabases(prev => ({ ...prev, samplePages: config.samplePagesDbId || '' }));
    if (config.evaluationsDbId) setAdditionalDatabases(prev => ({ ...prev, evaluations: config.evaluationsDbId || '' }));
    if (config.actionsDbId) setAdditionalDatabases(prev => ({ ...prev, actions: config.actionsDbId || '' }));
  }, [notionStorage]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enregistrer les clés
    notionStorage.updateStoredConfig({
      apiKey,
      databaseId,
      checklistsDbId: additionalDatabases.checklists,
      projectsDbId: additionalDatabases.projects,
      auditsDbId: additionalDatabases.audits,
      exigencesDbId: additionalDatabases.exigences,
      samplePagesDbId: additionalDatabases.samplePages,
      evaluationsDbId: additionalDatabases.evaluations,
      actionsDbId: additionalDatabases.actions
    });
    
    // Réinitialiser le mode et tester la connexion
    enableRealMode();
    
    // Tester la connexion
    testConnection();
    
    // Appeler le callback de succès si fourni
    if (onSuccess) onSuccess();
  };
  
  // Gérer le reset complet
  const handleReset = () => {
    notionStorage.clearStoredConfig();
    setApiKey('');
    setDatabaseId('');
    setAdditionalDatabases({
      checklists: '',
      projects: '',
      audits: '',
      exigences: '',
      samplePages: '',
      evaluations: '',
      actions: ''
    });
  };
  
  // Mise à jour des champs additionnels
  const handleDatabaseChange = (name: string, value: string) => {
    setAdditionalDatabases(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Configuration de Notion</h2>
        <OperationModeStatus showToggle={true} />
      </div>
      
      <Separator className="my-4" />
      
      <NotionApiKeyField
        apiKey={apiKey}
        onChange={setApiKey}
        className="mb-6"
      />
      
      <NotionDatabaseField
        label="Base de données principale"
        value={databaseId}
        onChange={setDatabaseId}
        id="main-database"
        required
      />
      
      <Separator className="my-6" />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Bases de données spécifiques (optionnel)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Vous pouvez spécifier des bases de données dédiées pour chaque type de contenu.
          Si non spécifiées, la base de données principale sera utilisée.
        </p>
        
        <Card>
          <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
            {Object.entries({
              checklists: 'Checklist',
              projects: 'Projets',
              audits: 'Audits',
              exigences: 'Exigences',
              samplePages: 'Pages échantillon',
              evaluations: 'Évaluations',
              actions: 'Actions correctives'
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`db-${key}`}>{label}</Label>
                <Input
                  id={`db-${key}`}
                  value={additionalDatabases[key as keyof typeof additionalDatabases]}
                  onChange={(e) => handleDatabaseChange(key, e.target.value)}
                  placeholder="ID de base de données"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <NotionConnectionTests
        className="my-6"
        apiKey={apiKey}
        databaseId={databaseId}
      />
      
      <NotionFormActions
        onCancel={onCancel}
        onReset={handleReset}
        isSubmitting={false}
      />
    </form>
  );
};

export default NotionConfigForm;
