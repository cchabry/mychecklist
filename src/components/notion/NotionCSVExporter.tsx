
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { notionCSVExporter } from '@/lib/notionCSVExporter';
import { Check, Download, FileDown, Database, Loader2 } from 'lucide-react';
import { DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotionCSVExporterProps {
  onClose?: () => void;
}

interface ExportableDatabase {
  id: string;
  name: string;
  description: string;
  exportFn: () => void;
}

/**
 * Composant pour exporter les données au format CSV pour Notion
 */
const NotionCSVExporter: React.FC<NotionCSVExporterProps> = ({ onClose }) => {
  const [downloadedFiles, setDownloadedFiles] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);
  
  const databases: ExportableDatabase[] = [
    {
      id: 'checklist',
      name: 'Checklist',
      description: 'Critères d\'évaluation et bonnes pratiques',
      exportFn: notionCSVExporter.downloadChecklistCSV.bind(notionCSVExporter)
    },
    {
      id: 'projects',
      name: 'Projets',
      description: 'Projets d\'audit de sites web',
      exportFn: notionCSVExporter.downloadProjectsCSV.bind(notionCSVExporter)
    },
    {
      id: 'pages',
      name: 'Pages',
      description: 'Échantillon de pages pour chaque projet',
      exportFn: notionCSVExporter.downloadPagesCSV.bind(notionCSVExporter)
    },
    {
      id: 'exigences',
      name: 'Exigences',
      description: 'Exigences spécifiques aux projets',
      exportFn: notionCSVExporter.downloadExigencesCSV.bind(notionCSVExporter)
    },
    {
      id: 'audits',
      name: 'Audits',
      description: 'Audits réalisés sur les projets',
      exportFn: notionCSVExporter.downloadAuditsCSV.bind(notionCSVExporter)
    },
    {
      id: 'evaluations',
      name: 'Évaluations',
      description: 'Évaluations des pages par rapport aux exigences',
      exportFn: notionCSVExporter.downloadEvaluationsCSV.bind(notionCSVExporter)
    },
    {
      id: 'actions',
      name: 'Actions',
      description: 'Actions correctives à réaliser',
      exportFn: notionCSVExporter.downloadActionsCSV.bind(notionCSVExporter)
    },
    {
      id: 'progress',
      name: 'Suivi',
      description: 'Suivi des actions correctives',
      exportFn: notionCSVExporter.downloadProgressCSV.bind(notionCSVExporter)
    }
  ];

  // Fonction pour télécharger un fichier CSV spécifique
  const downloadCSV = (database: ExportableDatabase) => {
    database.exportFn();
    
    setDownloadedFiles(prev => ({
      ...prev,
      [database.id]: true
    }));
  };

  // Télécharger tous les fichiers CSV
  const downloadAllCSV = () => {
    setIsExporting(true);
    notionCSVExporter.downloadAllCSV();
    
    // Marquer tous les fichiers comme téléchargés après un certain délai
    setTimeout(() => {
      const allDownloaded = databases.reduce((acc, db) => {
        acc[db.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      
      setDownloadedFiles(allDownloaded);
      setIsExporting(false);
    }, 2500);
  };

  return (
    <>
      <DialogTitle className="text-xl font-semibold">
        Exporter les données pour Notion
      </DialogTitle>
      
      <Tabs defaultValue="databases" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="databases">Bases de données</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="databases" className="mt-4">
          <ScrollArea className="max-h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-1">
              {databases.map((database) => (
                <Card key={database.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      {database.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {database.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-3 pt-0">
                    <Button 
                      variant={downloadedFiles[database.id] ? "outline" : "default"}
                      className="w-full flex items-center justify-center h-8 text-xs" 
                      onClick={() => downloadCSV(database)}
                    >
                      {downloadedFiles[database.id] ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <FileDown className="h-3 w-3 mr-1" />
                      )}
                      <span>Télécharger</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button 
              onClick={downloadAllCSV}
              className="flex items-center gap-2"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Télécharger tout</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="instructions" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Instructions d'importation</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li>Téléchargez les fichiers CSV en cliquant sur les boutons correspondants</li>
                <li>Dans Notion, ouvrez la page où vous souhaitez créer vos bases de données</li>
                <li>Créez la structure des bases de données dans cet ordre:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Checklist</strong> - Critères d'évaluation</li>
                    <li><strong>Projets</strong> - Liste des projets à auditer</li>
                    <li><strong>Pages</strong> - Échantillon de pages pour chaque projet</li>
                    <li><strong>Exigences</strong> - Exigences spécifiques aux projets</li>
                    <li><strong>Audits</strong> - Audits réalisés sur les projets</li>
                    <li><strong>Évaluations</strong> - Résultats d'évaluation</li>
                    <li><strong>Actions</strong> - Actions correctives</li>
                    <li><strong>Suivi</strong> - Suivi des actions correctives</li>
                  </ul>
                </li>
                <li>Pour chaque base de données:
                  <ol className="list-decimal pl-5 mt-2 space-y-1">
                    <li>Cliquez sur "•••" en haut à droite de la base de données</li>
                    <li>Sélectionnez "Importer" puis choisissez le fichier CSV correspondant</li>
                    <li>Vérifiez les correspondances de colonnes puis validez</li>
                  </ol>
                </li>
                <li>L'ordre d'importation est important pour préserver les relations entre les tables</li>
                <li>Une fois les données importées, vous pouvez configurer des relations entre les tables dans Notion</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default NotionCSVExporter;
