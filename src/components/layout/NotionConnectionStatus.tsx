
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { notionService } from '@/services/notion/notionService';

const NotionConnectionStatus: React.FC = () => {
  const isConfigured = notionService.isConfigured();
  const isMockMode = notionService.isMockMode();
  
  // Afficher un état différent selon la configuration
  if (isMockMode) {
    return (
      <Card className="mb-4 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Mode démonstration</h4>
              <p className="text-sm text-blue-700 mt-1">
                Utilisation de données fictives
              </p>
              <Button asChild variant="link" className="h-auto p-0 mt-1 text-blue-700">
                <Link to="/notion-config">
                  Configurer Notion
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!isConfigured) {
    return (
      <Card className="mb-4 bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Notion non configuré</h4>
              <p className="text-sm text-amber-700 mt-1">
                Configurez Notion pour utiliser l'application
              </p>
              <Button asChild variant="link" className="h-auto p-0 mt-1 text-amber-700">
                <Link to="/notion-config">
                  Configurer maintenant
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4 bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">Connecté à Notion</h4>
            <p className="text-sm text-green-700 mt-1">
              L'application est connectée à vos bases Notion
            </p>
            <Button asChild variant="link" className="h-auto p-0 mt-1 text-green-700">
              <Link to="/notion-config">
                Modifier la configuration
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionConnectionStatus;
