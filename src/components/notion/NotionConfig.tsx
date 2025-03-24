
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import NotionConnectionTests from './form/NotionConnectionTests';
import { operationMode } from '@/services/operationMode';

interface NotionConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NotionConfig: React.FC<NotionConfigProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [checklistsDbId, setChecklistsDbId] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [showTestButtons, setShowTestButtons] = useState(false);

  useEffect(() => {
    // Charger les valeurs depuis localStorage
    const storedApiKey = localStorage.getItem('notion_api_key') || '';
    const storedDatabaseId = localStorage.getItem('notion_database_id') || '';
    const storedChecklistsDbId = localStorage.getItem('notion_checklists_database_id') || '';

    setApiKey(storedApiKey);
    setDatabaseId(storedDatabaseId);
    setChecklistsDbId(storedChecklistsDbId);

    // Afficher les boutons de test si nous avons une configuration
    setShowTestButtons(!!(storedApiKey && storedDatabaseId));
  }, [isOpen]);

  const handleSave = () => {
    // Enregistrer les valeurs dans localStorage
    if (apiKey) {
      localStorage.setItem('notion_api_key', apiKey);
    }

    if (databaseId) {
      localStorage.setItem('notion_database_id', databaseId);
    }

    if (checklistsDbId) {
      localStorage.setItem('notion_checklists_database_id', checklistsDbId);
    }

    // Désactiver le mode démo après une configuration
    operationMode.enableRealMode();

    // Appeler le callback onSuccess si fourni
    if (onSuccess) {
      onSuccess();
    }

    // Fermer la boîte de dialogue
    onClose();
  };

  const handleTestSuccess = () => {
    // Afficher les boutons de test après une configuration réussie
    setShowTestButtons(true);
    
    // Si le callback onSuccess est fourni, l'appeler
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configuration Notion</DialogTitle>
          <DialogDescription>
            Connectez votre compte Notion pour synchroniser vos données
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">API et Base principale</TabsTrigger>
            <TabsTrigger value="checklists">Base Checklists</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Ces paramètres sont nécessaires pour le fonctionnement général de l'application.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
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
                  Créez une clé API dans les paramètres d'intégration de Notion.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="databaseId">ID de base de données (Projets)</Label>
                <Input
                  id="databaseId"
                  placeholder="Exemple: 1a2b3c4d5e6f..."
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  L'ID se trouve dans l'URL de votre base de données Notion.
                </p>
              </div>

              {showTestButtons && (
                <NotionConnectionTests onSuccess={handleTestSuccess} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="checklists" className="space-y-4 pt-4">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fonctionnalité avancée</AlertTitle>
              <AlertDescription>
                Cette configuration est nécessaire pour stocker et accéder aux checklists 
                d'audit dans Notion.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="checklistsDbId">ID de base de données (Checklists)</Label>
              <Input
                id="checklistsDbId"
                placeholder="Exemple: 1a2b3c4d5e6f..."
                value={checklistsDbId}
                onChange={(e) => setChecklistsDbId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                L'ID se trouve dans l'URL de votre base de données Notion pour les checklists.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
