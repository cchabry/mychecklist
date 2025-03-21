
import React from 'react';
import { notionApi } from '@/lib/notionProxy';
import { Button } from '@/components/ui/button';
import { AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Settings, Database, X } from 'lucide-react';

interface NotionSolutionsSectionProps {
  showApiKey?: boolean;
  showCorsProxy?: boolean;
  showMockMode?: boolean;
}

const NotionSolutionsSection: React.FC<NotionSolutionsSectionProps> = ({
  showApiKey = false,
  showCorsProxy = false,
  showMockMode = false
}) => {
  // Activation du mode mock
  const handleEnableMockMode = () => {
    notionApi.mockMode.activate();
    // Forcer un rechargement pour appliquer le mode mock
    setTimeout(() => window.location.reload(), 1000);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Solutions possibles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {showApiKey && (
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => {
              // Ouvrir la page de configuration Notion
              window.location.href = "/diagnostics"; 
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configurer l'API Notion
          </Button>
        )}
        
        {showCorsProxy && (
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => {
              // Ouvrir la documentation
              window.open("https://developers.notion.com/reference/cors", "_blank");
            }}
          >
            <Database className="mr-2 h-4 w-4" />
            Vérifier le CORS Proxy
          </Button>
        )}
        
        {showMockMode && (
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={handleEnableMockMode}
          >
            <Database className="mr-2 h-4 w-4" />
            Utiliser le mode démo
          </Button>
        )}
        
        <AlertDialogCancel asChild>
          <Button variant="outline" className="justify-start">
            <X className="mr-2 h-4 w-4" />
            Fermer
          </Button>
        </AlertDialogCancel>
      </div>
    </div>
  );
};

export default NotionSolutionsSection;
