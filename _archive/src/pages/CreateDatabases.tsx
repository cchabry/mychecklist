
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, FileText } from 'lucide-react';
import { notionCSVExporter } from '@/lib/notionCSVExporter';

const CreateDatabases = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Création des bases de données Notion</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Télécharger les modèles CSV</CardTitle>
            <CardDescription>
              Téléchargez les fichiers CSV pour créer les bases de données Notion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => notionCSVExporter.downloadProjectsCSV()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Télécharger le modèle de projets
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => notionCSVExporter.downloadChecklistCSV()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Télécharger le modèle de checklist
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => notionCSVExporter.downloadPagesCSV()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Télécharger le modèle de pages
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => notionCSVExporter.downloadAllCSV()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Télécharger tous les modèles
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>2. Créer les bases dans Notion</CardTitle>
            <CardDescription>
              Créez les bases de données dans Notion et importez les données CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open("https://www.notion.so/help/import-data-into-notion", "_blank")}
              >
                <Database className="mr-2 h-4 w-4" />
                Guide d'importation Notion
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open("https://www.notion.so/", "_blank")}
              >
                <Database className="mr-2 h-4 w-4" />
                Ouvrir Notion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateDatabases;
