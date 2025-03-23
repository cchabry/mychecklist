
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { extractNotionDatabaseId } from '@/lib/notion';
import { toast } from 'sonner';

const NotionConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('notion_api_key') || '');
  const [databaseId, setDatabaseId] = useState(localStorage.getItem('notion_database_id') || '');
  const [checklistsDbId, setChecklistsDbId] = useState(localStorage.getItem('notion_checklists_database_id') || '');

  const saveConfig = () => {
    if (!apiKey.trim()) {
      toast.error('La clé API est requise');
      return;
    }
    
    if (!databaseId.trim()) {
      toast.error('L\'ID de base de données de projets est requis');
      return;
    }
    
    // Sauvegarder les valeurs
    localStorage.setItem('notion_api_key', apiKey);
    localStorage.setItem('notion_database_id', databaseId);
    
    if (checklistsDbId.trim()) {
      localStorage.setItem('notion_checklists_database_id', checklistsDbId);
    } else {
      localStorage.removeItem('notion_checklists_database_id');
    }
    
    toast.success('Configuration Notion sauvegardée');
  };
  
  const resetConfig = () => {
    setApiKey('');
    setDatabaseId('');
    setChecklistsDbId('');
    
    localStorage.removeItem('notion_api_key');
    localStorage.removeItem('notion_database_id');
    localStorage.removeItem('notion_checklists_database_id');
    
    toast.info('Configuration Notion réinitialisée');
  };
  
  const handleDatabaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const url = e.target.value;
    const extractedId = extractNotionDatabaseId(url);
    setter(extractedId || url);
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
        <div className="space-y-2">
          <Label htmlFor="apiKey">Clé API Notion</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="secret_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Créez une intégration dans <a href="https://www.notion.so/my-integrations" className="text-primary underline" target="_blank" rel="noopener noreferrer">Notion Developer</a> pour obtenir une clé API.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="databaseId">ID Base de données Projets</Label>
          <Input
            id="databaseId"
            placeholder="ID ou URL de la base de données"
            value={databaseId}
            onChange={(e) => handleDatabaseUrlChange(e, setDatabaseId)}
          />
          <p className="text-xs text-muted-foreground">
            Copiez l'URL de votre base de données Notion et collez-la ici.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="checklistsDbId">ID Base de données Checklists (optionnel)</Label>
          <Input
            id="checklistsDbId"
            placeholder="ID ou URL de la base de données (optionnel)"
            value={checklistsDbId}
            onChange={(e) => handleDatabaseUrlChange(e, setChecklistsDbId)}
          />
          <p className="text-xs text-muted-foreground">
            Si vous utilisez une base de données séparée pour vos checklists, indiquez-la ici.
          </p>
        </div>
        
        <Alert>
          <AlertDescription>
            N'oubliez pas de partager votre(s) base(s) de données avec votre intégration Notion.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetConfig}>
          Réinitialiser
        </Button>
        <Button onClick={saveConfig}>
          Sauvegarder
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionConfig;
