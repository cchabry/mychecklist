
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, RotateCw } from "lucide-react";
import { notionApi } from '@/lib/notionProxy';

interface NotionCreatePageTestProps {
  onClose: () => void;
}

const NotionCreatePageTest: React.FC<NotionCreatePageTestProps> = ({ onClose }) => {
  const [pageUrl, setPageUrl] = useState('');
  const [pageCreated, setPageCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier si l'URL est valide
      if (!pageUrl.startsWith('https://')) {
        setError('URL invalide. L\'URL doit commencer par https://');
        setIsLoading(false);
        return;
      }

      // Extraire le projectId de l'URL
      const urlParts = pageUrl.split('/');
      const projectId = urlParts[4] || 'default-project';

      // Créer la page
      const newPage = await notionApi.createSamplePage({
        projectId: projectId,
        url: pageUrl,
        title: `Page de test ${Date.now()}`,
        description: 'Page créée pour tester l\'intégration Notion',
        order: 1
      });

      if (newPage) {
        setPageCreated(true);
      } else {
        setError('Erreur lors de la création de la page.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
      setError(`Erreur lors de la création de la page: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Créer une page de test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-url">URL de la page</Label>
          <Input
            id="page-url"
            placeholder="https://www.notion.so/tmwagency/Nom-du-Projet-466c66e640404ea7a95345cf731a6d91?pvs=4"
            value={pageUrl}
            onChange={(e) => setPageUrl(e.target.value)}
            disabled={isLoading || pageCreated}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 text-destructive p-4">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <h3 className="text-sm font-medium">Erreur</h3>
            </div>
            <p className="text-sm opacity-70">{error}</p>
          </div>
        )}

        {pageCreated && (
          <div className="rounded-md border border-green-500/50 bg-green-500/5 text-green-500 p-4">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="text-sm font-medium">Succès</h3>
            </div>
            <p className="text-sm opacity-70">Page créée avec succès !</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleCreatePage} disabled={isLoading || pageCreated}>
          {isLoading ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            'Créer la page'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionCreatePageTest;
