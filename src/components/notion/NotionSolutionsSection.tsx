
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Key, Globe } from 'lucide-react';

interface NotionSolutionsSectionProps {
  showApiKey?: boolean;
  showCorsProxy?: boolean;
  showMockMode?: boolean;
}

const NotionSolutionsSection: React.FC<NotionSolutionsSectionProps> = ({ 
  showApiKey = true, 
  showCorsProxy = true,
  showMockMode = false
}) => {
  return (
    <div className="space-y-4">
      {showApiKey && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Problème de clé API</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Si vous rencontrez des erreurs d'authentification, votre clé API pourrait être invalide ou expirée.
                </p>
                <Button variant="outline" size="sm">
                  Vérifier la clé API
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showCorsProxy && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Problème de proxy CORS</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Les erreurs CORS peuvent empêcher la connexion à l'API Notion depuis votre navigateur.
                </p>
                <Button variant="outline" size="sm">
                  Configurer le proxy CORS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showMockMode && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Utiliser le mode démo</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Si vous ne pouvez pas configurer Notion, vous pouvez utiliser le mode démo pour tester l'application.
                </p>
                <Button variant="outline" size="sm">
                  Activer le mode démo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotionSolutionsSection;
