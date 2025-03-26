import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractNotionDatabaseId } from '@/lib/notion';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { Info, Database, Key, RefreshCw, AlertTriangle, Search, FileText } from 'lucide-react';
import { useOperationMode } from '@/services/operationMode';
import { operationMode } from '@/services/operationMode';
import NotionDatabaseDiscovery, { NotionDatabaseTarget } from '../NotionDatabaseDiscovery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { notionWriteService } from '@/services/notion/notionWriteService';

interface DatabaseConfig {
  id: string;
  key: string;
  label: string;
  description: string;
  required: boolean;
}

/**
 * Composant de configuration Notion pour la page de configuration
 */
const NotionConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('notion_api_key') || '');
  const [databaseConfigs, setDatabaseConfigs] = useState<Record<NotionDatabaseTarget, string>>({
    projects: localStorage.getItem('notion_database_id') || '',
    checklists: localStorage.getItem('notion_checklists_database_id') || '',
    exigences: localStorage.getItem('notion_exigences_database_id') || '',
    pages: localStorage.getItem('notion_pages_database_id') || '',
    audits: localStorage.getItem('notion_audits_database_id') || '',
    evaluations: localStorage.getItem('notion_evaluations_database_id') || '',
    actions: localStorage.getItem('notion_actions_database_id') || '',
    progress: localStorage.getItem('notion_progress_database_id') || ''
  });
  
  const [activeTab, setActiveTab] = useState<string>('core');
  const [isTesting, setIsTesting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showDatabaseDiscovery, setShowDatabaseDiscovery] = useState(false);
  const { isDemoMode } = useOperationMode();

  const DATABASE_DEFINITIONS: Record<string, DatabaseConfig[]> = {
    core: [
      { 
        id: 'projects', 
        key: 'notion_database_id',
        label: 'Base de données Projets', 
        description: 'Contient les informations sur les sites web à auditer',
        required: true
      },
      { 
        id: 'checklists', 
        key: 'notion_checklists_database_id',
        label: 'Base de données Checklists', 
        description: 'Référentiel de bonnes pratiques servant de critères d\'évaluation',
        required: false
      }
    ],
    advanced: [
      { 
        id: 'exigences', 
        key: 'notion_exigences_database_id',
        label: 'Base de données Exigences', 
        description: 'Bonnes pratiques retenues pour un projet spécifique',
        required: false
      },
      { 
        id: 'pages', 
        key: 'notion_pages_database_id',
        label: 'Base de données Pages', 
        description: 'Échantillon de pages à auditer pour chaque projet',
        required: false
      },
      { 
        id: 'audits', 
        key: 'notion_audits_database_id',
        label: 'Base de données Audits', 
        description: 'Informations générales sur les audits réalisés',
        required: false
      },
      { 
        id: 'evaluations', 
        key: 'notion_evaluations_database_id',
        label: 'Base de données Évaluations', 
        description: 'Résultats d\'évaluation pour chaque page et exigence',
        required: false
      },
      { 
        id: 'actions', 
        key: 'notion_actions_database_id',
        label: 'Base de données Actions correctives', 
        description: 'Actions correctives à réaliser suite aux évaluations',
        required: false
      },
      { 
        id: 'progress', 
        key: 'notion_progress_database_id',
        label: 'Base de données Progrès', 
        description: 'Suivi de l\'avancement des actions correctives',
        required: false
      }
    ]
  };

  useEffect(() => {
    const lastConfigDate = localStorage.getItem('notion_last_config_date');
    if (lastConfigDate) {
      try {
        const date = new Date(lastConfigDate);
        setLastSaved(date.toLocaleString());
      } catch (e) {
        console.error('Erreur de format de date:', e);
      }
    }
  }, []);

  const saveConfig = () => {
    if (!apiKey.trim()) {
      toast.error('La clé API est requise');
      return;
    }
    
    if (!databaseConfigs.projects.trim()) {
      toast.error('L\'ID de base de données de projets est requis');
      return;
    }
    
    localStorage.setItem('notion_api_key', apiKey);
    
    Object.entries(databaseConfigs).forEach(([dbType, dbId]) => {
      const storageKey = dbType === 'projects' 
        ? 'notion_database_id' 
        : `notion_${dbType}_database_id`;
      
      const cleanDbId = extractNotionDatabaseId(dbId);
      
      if (cleanDbId) {
        localStorage.setItem(storageKey, cleanDbId);
      } else {
        localStorage.removeItem(storageKey);
      }
    });
    
    localStorage.setItem('notion_last_config_date', new Date().toISOString());
    setLastSaved(new Date().toLocaleString());
    
    if (isDemoMode) {
      toast.success('Configuration Notion sauvegardée', {
        description: 'Souhaitez-vous essayer de passer en mode réel?',
        action: {
          label: 'Oui',
          onClick: () => {
            operationMode.enableRealMode();
            testConnection();
          }
        }
      });
    } else {
      toast.success('Configuration Notion sauvegardée');
      testConnection();
    }
  };
  
  const resetConfig = () => {
    setApiKey('');
    
    const emptyConfigs = Object.keys(databaseConfigs).reduce(
      (acc, key) => ({ ...acc, [key]: '' }), 
      {} as Record<NotionDatabaseTarget, string>
    );
    setDatabaseConfigs(emptyConfigs);
    
    localStorage.removeItem('notion_api_key');
    localStorage.removeItem('notion_database_id');
    
    Object.keys(databaseConfigs).forEach(dbType => {
      if (dbType !== 'projects') {
        localStorage.removeItem(`notion_${dbType}_database_id`);
      }
    });
    
    localStorage.removeItem('notion_last_config_date');
    
    setLastSaved(null);
    
    toast.info('Configuration Notion réinitialisée');
  };
  
  const testConnection = async () => {
    if (!apiKey) {
      toast.error('Clé API manquante', {
        description: 'Veuillez renseigner une clé API pour tester la connexion'
      });
      return;
    }
    
    setIsTesting(true);
    
    try {
      const wasMockMode = notionApi.mockMode.isActive();
      if (wasMockMode) {
        notionApi.mockMode.temporarilyForceReal();
      }
      
      const userResponse = await notionApi.users.me(apiKey);
      
      const dbTestResults: {id: string, name: string, success: boolean, error?: string}[] = [];
      
      for (const [dbType, dbId] of Object.entries(databaseConfigs)) {
        if (!dbId) continue;
        
        const cleanDbId = extractNotionDatabaseId(dbId);
        if (!cleanDbId) continue;
        
        try {
          const dbResponse = await notionApi.databases.retrieve(cleanDbId, apiKey);
          const dbName = dbResponse.title?.[0]?.plain_text || 'Base de données';
          
          dbTestResults.push({
            id: dbType,
            name: dbName,
            success: true
          });
        } catch (dbError: any) {
          dbTestResults.push({
            id: dbType,
            name: `Base de données ${dbType}`,
            success: false,
            error: dbError.message || 'Erreur d\'accès à la base de données'
          });
        }
      }
      
      const successCount = dbTestResults.filter(r => r.success).length;
      const totalTests = dbTestResults.length;
      
      if (totalTests > 0) {
        if (successCount === totalTests) {
          toast.success(`Connexion réussie à toutes les bases de données (${successCount}/${totalTests})`, {
            description: `Connecté en tant que ${userResponse.name}`
          });
        } else {
          toast.warning(`Connexion partielle aux bases de données (${successCount}/${totalTests})`, {
            description: `Certaines bases de données ne sont pas accessibles`
          });
          
          dbTestResults.filter(r => !r.success).forEach(result => {
            toast.error(`Erreur d'accès: ${result.name}`, {
              description: result.error
            });
          });
        }
      } else {
        toast.success('Connexion à l\'API Notion réussie', {
          description: `Connecté en tant que ${userResponse.name}`
        });
      }
      
      if (isDemoMode) {
        operationMode.enableRealMode();
      }
    } catch (error: any) {
      toast.error('Erreur de connexion à Notion', {
        description: error.message || 'Vérifiez votre clé API'
      });
      
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDatabaseUrlChange = (dbId: NotionDatabaseTarget, value: string) => {
    setDatabaseConfigs(prev => ({
      ...prev,
      [dbId]: value
    }));
  };

  const handleDiscoveryOpen = () => {
    if (!apiKey) {
      toast.error("Veuillez d'abord saisir une clé API Notion", {
        description: "Une clé API est nécessaire pour découvrir les bases de données"
      });
      return;
    }
    
    setShowDatabaseDiscovery(true);
  };

  const handleSelectDatabase = (id: string, target: NotionDatabaseTarget) => {
    const cleanId = extractNotionDatabaseId(id);
    
    setDatabaseConfigs(prev => ({
      ...prev,
      [target]: cleanId
    }));
    
    toast.success(`ID de base "${target}" mis à jour`, {
      description: "N'oubliez pas d'enregistrer la configuration"
    });
  };

  const renderDatabaseFields = (tabId: string) => {
    return DATABASE_DEFINITIONS[tabId]?.map(db => (
      <div key={db.id} className="space-y-2">
        <Label htmlFor={db.id} className="flex items-center gap-1.5">
          <Database className="h-4 w-4 text-muted-foreground" />
          {db.label} {db.required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={db.id}
          placeholder="ID ou URL de la base de données"
          value={databaseConfigs[db.id as NotionDatabaseTarget] || ''}
          onChange={(e) => handleDatabaseUrlChange(db.id as NotionDatabaseTarget, e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {db.description}
        </p>
      </div>
    ));
  };

  const handleTestWrite = async () => {
    if (!apiKey || !databaseConfigs.projects) {
      toast.error('Configuration incomplète', {
        description: 'Veuillez saisir une clé API et un ID de base de données Projets'
      });
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const testProject = {
        name: `Test d'écriture ${timestamp}`,
        description: "Projet de test pour vérifier l'écriture dans Notion",
        url: "https://exemple.fr/test",
        status: "Test"
      };

      const result = await notionWriteService.createProject(testProject);

      if (result) {
        toast.success('Test d\'écriture réussi', {
          description: `Projet de test créé avec succès à ${timestamp}`
        });
      } else {
        toast.error('Échec du test d\'écriture');
      }
    } catch (error) {
      toast.error('Erreur lors du test d\'écriture', {
        description: error.message
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuration Notion</CardTitle>
        <CardDescription>
          Paramètres de connexion à vos bases Notion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDemoMode && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Mode démonstration actif</AlertTitle>
            <AlertDescription className="text-amber-700">
              L'application est en mode démonstration. Configurez Notion pour utiliser vos données réelles.
            </AlertDescription>
          </Alert>
        )}
        
        {lastSaved && (
          <div className="text-xs text-muted-foreground flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Dernière configuration: {lastSaved}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="flex items-center gap-1.5">
            <Key className="h-4 w-4 text-muted-foreground" />
            Clé API Notion
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="secret_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Créez une intégration dans <a href="https://www.notion.so/my-integrations" className="text-primary underline" target="_blank" rel="noopener noreferrer">Notion Developer</a> pour obtenir une clé API.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5"
            onClick={handleDiscoveryOpen}
          >
            <Search className="h-4 w-4" />
            Découverte BDD Notion
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <Tabs defaultValue="core" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="core">Bases principales</TabsTrigger>
            <TabsTrigger value="advanced">Bases avancées</TabsTrigger>
          </TabsList>
          
          <TabsContent value="core" className="space-y-4">
            {renderDatabaseFields('core')}
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            {renderDatabaseFields('advanced')}
          </TabsContent>
        </Tabs>
        
        <Alert>
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            N'oubliez pas de partager vos bases de données avec votre intégration Notion.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            onClick={testConnection} 
            disabled={isTesting}
            variant="outline"
            className="gap-1"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Tester la connexion
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleTestWrite} 
            variant="outline"
            className="gap-1"
            disabled={isTesting || !apiKey || !databaseConfigs.projects}
          >
            <FileText className="h-4 w-4" />
            Tester l'écriture
          </Button>
        </div>
        
        <Button onClick={saveConfig} disabled={isTesting}>
          Sauvegarder
        </Button>
      </CardFooter>
      
      <NotionDatabaseDiscovery 
        open={showDatabaseDiscovery} 
        onOpenChange={setShowDatabaseDiscovery}
        apiKey={apiKey}
        onSelectDatabase={handleSelectDatabase}
        autoClose={false}
      />
    </Card>
  );
};

export default NotionConfig;
