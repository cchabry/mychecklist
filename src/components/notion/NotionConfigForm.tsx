
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { notionApi } from '@/lib/notionProxy';
import { AlertCircle, Share2, Save } from 'lucide-react';
import NotionTestButton from './NotionTestButton';
import NotionWriteTestButton from './NotionWriteTestButton';
import { Checkbox } from '@/components/ui/checkbox';
import { getNotionConfig } from '@/lib/notion';

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
  // Vérifier à la fois les valeurs dans les champs ET les valeurs dans localStorage
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
    notionApi.mockMode.reset();
    // Réinitialiser les champs du formulaire après la réinitialisation du mode mock
    setApiKey('');
    setProjectsDbId('');
    setChecklistsDbId('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      {lastSaved && (
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
          <Save size={14} />
          <span>Dernière configuration sauvegardée: {lastSaved}</span>
        </div>
      )}
      
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
      
      <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-md">
        <Share2 size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <p className="font-semibold">Important : Connectez votre intégration</p>
          <p className="mt-1">Les bases de données doivent être connectées à votre intégration Notion :</p>
          <ol className="mt-1 space-y-1 list-decimal list-inside">
            <li>Dans Notion, ouvrez votre base de données</li>
            <li>Cliquez sur les <strong>...</strong> (trois points) en haut à droite</li>
            <li>Sélectionnez <strong>Connexions</strong> dans le menu</li>
            <li>Recherchez et ajoutez votre intégration</li>
            <li>Vérifiez que les permissions d'écriture sont activées</li>
          </ol>
        </div>
      </div>
      
      {/* Section de test de connexion - TOUJOURS affichée si valeurs dans localStorage, même si les champs sont vides */}
      {canShowTests && (
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
