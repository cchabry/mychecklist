
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download } from 'lucide-react';

interface NotionCSVExporterProps {
  onClose?: () => void;
}

const NotionCSVExporter: React.FC<NotionCSVExporterProps> = ({ onClose }) => {
  const handleExportCSV = () => {
    // Mock export functionality
    setTimeout(() => {
      const blob = new Blob(['id,name,url,progress\n1,Projet test,https://example.com,50'], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notion_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (onClose) {
        onClose();
      }
    }, 500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exporter les données en CSV</CardTitle>
        <CardDescription>
          Téléchargez vos données Notion au format CSV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité vous permet d'exporter vos données pour les utiliser dans un tableur ou une autre application.
          </p>
          
          <div className="flex justify-end space-x-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
            )}
            
            <Button onClick={handleExportCSV} className="gap-2">
              <Download size={16} />
              Exporter en CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionCSVExporter;
