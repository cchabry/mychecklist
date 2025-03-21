
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
import { Check, Download, FileDown } from 'lucide-react';

interface NotionCSVExporterProps {
  onClose?: () => void;
}

/**
 * Composant pour exporter les données au format CSV pour Notion
 */
const NotionCSVExporter: React.FC<NotionCSVExporterProps> = ({ onClose }) => {
  const [downloadedFiles, setDownloadedFiles] = useState<Record<string, boolean>>({
    checklist: false,
    projects: false,
    pages: false
  });

  // Fonction pour télécharger un fichier CSV spécifique
  const downloadCSV = (type: 'checklist' | 'projects' | 'pages') => {
    if (type === 'checklist') {
      notionCSVExporter.downloadChecklistCSV();
    } else if (type === 'projects') {
      notionCSVExporter.downloadProjectsCSV();
    } else if (type === 'pages') {
      notionCSVExporter.downloadPagesCSV();
    }
    
    setDownloadedFiles(prev => ({
      ...prev,
      [type]: true
    }));
  };

  // Télécharger tous les fichiers CSV
  const downloadAllCSV = () => {
    notionCSVExporter.downloadAllCSV();
    
    setDownloadedFiles({
      checklist: true,
      projects: true,
      pages: true
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Exporter les données pour Notion</CardTitle>
        <CardDescription>
          Téléchargez les fichiers CSV à importer dans vos bases de données Notion.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Instructions d'importation</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Téléchargez les fichiers CSV ci-dessous</li>
            <li>Dans Notion, ouvrez la page où vous souhaitez créer vos bases de données</li>
            <li>Créez d'abord la base de données <strong>Checklist</strong></li>
            <li>Cliquez sur "•••" en haut à droite de la base de données</li>
            <li>Sélectionnez "Importer" puis choisissez le fichier CSV de checklist</li>
            <li>Répétez le processus pour les bases <strong>Projets</strong> puis <strong>Pages</strong></li>
            <li>L'ordre d'importation est important pour préserver les relations entre les tables</li>
          </ol>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Button 
            variant={downloadedFiles.checklist ? "outline" : "default"}
            className="flex items-center space-x-2" 
            onClick={() => downloadCSV('checklist')}
          >
            {downloadedFiles.checklist ? <Check className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
            <span>Checklist</span>
          </Button>
          
          <Button 
            variant={downloadedFiles.projects ? "outline" : "default"}
            className="flex items-center space-x-2" 
            onClick={() => downloadCSV('projects')}
          >
            {downloadedFiles.projects ? <Check className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
            <span>Projets</span>
          </Button>
          
          <Button 
            variant={downloadedFiles.pages ? "outline" : "default"}
            className="flex items-center space-x-2" 
            onClick={() => downloadCSV('pages')}
          >
            {downloadedFiles.pages ? <Check className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
            <span>Pages</span>
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button 
          onClick={downloadAllCSV}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Télécharger tout</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionCSVExporter;
