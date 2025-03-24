import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractNotionDatabaseId } from '@/lib/notion';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { Info, Database, Key, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import { useOperationMode } from '@/services/operationMode';
import { operationMode } from '@/services/operationMode';
import NotionDatabaseDiscovery from '../NotionDatabaseDiscovery';

/**
 * Composant de configuration Notion pour la page de configuration
 */
const NotionConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('notion_api_key') || '');
  const [databaseId, setDatabaseId] = useState(localStorage.getItem('notion_database_id') || '');
  const [checklistsDbId, setChecklistsDbId] = useState(localStorage.getItem('notion_checklists_database_id') || '');
  const [isTesting, setIsTesting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showDatabaseDiscovery, setShowDatabaseDiscovery] = useState(false);
  const { isDemoMode } = useOperationMode();

  // Charger la date de dernière configuration
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
    
    if (!databaseId.trim()) {
      toast.error('L\'ID de base de données de projets est requis');
      return;
    }
    
    // Extraire les IDs propres à partir des URLs
    const cleanDatabaseId = extractNotionDatabaseId(databaseId);
    const cleanChecklistsDbId = checklistsDbId ? extractNotionDatabaseId(checklistsDbId) : '';
    
    // Sauvegarder les valeurs
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', cleanDatabaseId);
    
    if (cleanChecklistsDbId) {
      localStorage.setItem('notion_checklists_database_id', cleanChecklistsDbId);
    } else {
      localStorage.removeItem('notion_checklists_database_id');
    }
    
    // Sauvegarder la date de configuration
    localStorage.setItem('notion_last_config_date', new Date().toISOString());
    setLastSaved(new Date().toLocaleString());
    
    // Si en mode démo, demander à l'utilisateur s'il veut essayer le mode réel
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
    setDatabaseId('');
    setChecklistsDbId('');
    
    localStorage.removeItem('notion_api_key');
    localStorage.removeItem('notion_database_id');
    localStorage.removeItem('notion_checklists_database_id');
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
      // Désactiver temporairement le mode mock pour le test
      const wasMockMode = notionApi.mockMode.isActive();
      if (wasMockMode) {
        notionApi.mockMode.temporarilyForceReal();
      }
      
      // Tester la connexion
      const userResponse = await notionApi.users.me(apiKey);
      
      // Tester l'accès à la BDD projets si un ID est fourni
      if (databaseId) {
        try {
          const dbResponse = await notionApi.databases.retrieve(extractNotionDatabaseId(databaseId), apiKey);
          const dbName = dbResponse.title?.[0]?.plain_text || 'Base de données';
          
          toast.success('Connexion à Notion réussie', {
            description: `Connecté en tant que ${userResponse.name} avec accès à "${dbName}"`
          });
        } catch (dbError) {
          toast.error('Erreur d\'accès à la base de données', {
            description: dbError.message || 'Vérifiez l\'ID de base de données'
          });
        }
      } else {
        toast.success('Connexion à l\'API Notion réussie', {
          description: `Connecté en tant que ${userResponse.name}`
        });
      }
      
      // Tester l'accès à la BDD checklists si fournie
      if (checklistsDbId) {
        try {
          const checklistDbResponse = await notionApi.databases.retrieve(
            extractNotionDatabaseId(checklistsDbId), 
            apiKey
          );
          const checklistDbName = checklistDbResponse.title?.[0]?.plain_text || 'Base de checklists';
          
          toast.success('Accès à la base de checklists confirmé', {
            description: `Accès à "${checklistDbName}" vérifié`
          });
        } catch (checklistError) {
          toast.warning('Erreur d\'accès à la base de checklists', {
            description: checklistError.message || 'Vérifiez l\'ID de base de checklists'
          });
        }
      }
      
      // Passer en mode réel si le test a réussi
      if (isDemoMode) {
        operationMode.enableRealMode();
      }
      
    } catch (error) {
      toast.error('Erreur de connexion à Notion', {
        description: error.message || 'Vérifiez votre clé API'
      });
      
      // Signaler l'erreur
      operationMode.handleConnectionError(
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleDatabaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const url = e.target.value;
    setter(url);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuration Notion</CardTitle>
        <CardDescription>
          Paramètres de connexion à votre base Notion
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
        
        <div className="space-y-2">
          <Label htmlFor="databaseId" className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-muted-foreground" />
            ID Base de données Projets
          </Label>
          <Input
            id="databaseId"
            placeholder="ID ou URL de la base de données"
            value={databaseId}
            onChange={(e) => handleDatabaseUrlChange(e, setDatabaseId)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Copiez l'URL de votre base de données Notion et collez-la ici.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="checklistsDbId" className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-muted-foreground" />
            ID Base de données Checklists (optionnel)
          </Label>
          <Input
            id="checklistsDbId"
            placeholder="ID ou URL de la base de données (optionnel)"
            value={checklistsDbId}
            onChange={(e) => handleDatabaseUrlChange(e, setChecklistsDbId)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Si vous utilisez une base de données séparée pour vos checklists, indiquez-la ici.
          </p>
        </div>
        
        <Alert>
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            N'oubliez pas de partager votre(s) base(s) de données avec votre intégration Notion.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between">
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetConfig}>
            Réinitialiser
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testConnection} 
            disabled={isTesting}
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
        </div>
        
        <Button onClick={saveConfig} disabled={isTesting}>
          Sauvegarder
        </Button>
      </CardFooter>
      
      <NotionDatabaseDiscovery 
        open={showDatabaseDiscovery} 
        onOpenChange={setShowDatabaseDiscovery}
        apiKey={apiKey}
      />
    </Card>
  );
};

export default NotionConfig;
