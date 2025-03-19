
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { notionApi } from '@/lib/notionProxy';
import { AlertCircle } from 'lucide-react';
import NotionTestButton from './NotionTestButton';
import NotionWriteTestButton from './NotionWriteTestButton';

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
    notionApi.mockMode.reset();
    // Réinitialiser les champs du formulaire après la réinitialisation du mode mock
    setApiKey('');
    setProjectsDbId('');
    setChecklistsDbId('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-sm font-medium">
          Clé d'API Notion
        </label>
        <Input
          id="apiKey"
          type="password"
          placeholder="secret_xxxx..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Clé d'intégration de votre application Notion ou token OAuth
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="projectsDbId" className="text-sm font-medium">
          ID de la base de données Projets
        </label>
        <Input
          id="projectsDbId"
          placeholder="https://www.notion.so/workspace/xxxxxxxx?v=yyyy ou juste l'ID"
          value={projectsDbId}
          onChange={(e) => setProjectsDbId(e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          URL ou ID de votre base de données Notion contenant les projets
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="checklistsDbId" className="text-sm font-medium">
          ID de la base de données Checklists
        </label>
        <Input
          id="checklistsDbId"
          placeholder="https://www.notion.so/workspace/xxxxxxxx?v=yyyy ou juste l'ID"
          value={checklistsDbId}
          onChange={(e) => setChecklistsDbId(e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          URL ou ID de votre base de données Notion contenant les checklists d'audit
        </p>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
        <AlertCircle size={14} />
        <span>Les deux bases de données doivent être partagées avec votre intégration Notion</span>
      </div>
      
      {/* Section de test de connexion */}
      {(apiKey && projectsDbId) && (
        <div className="flex flex-col gap-2 pt-2">
          <p className="text-xs font-medium text-gray-500">Tests de connexion :</p>
          <div className="flex gap-2">
            <NotionTestButton onSuccess={() => {
              // Rafraîchir la page après un test réussi
              setTimeout(() => window.location.reload(), 1000);
            }} />
            <NotionWriteTestButton onSuccess={() => {
              // Rafraîchir la page après un test réussi
              setTimeout(() => window.location.reload(), 1000);
            }} />
          </div>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="text-amber-600 border-amber-200 hover:bg-amber-50" 
            onClick={resetMockMode}
          >
            Réinitialiser
          </Button>
        </div>
        <Button type="submit" disabled={isSubmitting} className="bg-tmw-teal hover:bg-tmw-teal/90">
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Vérification...
            </>
          ) : (
            "Enregistrer"
          )}
        </Button>
      </div>
    </form>
  );
};

export default NotionConfigForm;
