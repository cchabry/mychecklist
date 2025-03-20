
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Workflow, Key } from 'lucide-react';

interface NotionSolutionsSectionProps {
  showCorsProxy?: boolean;
  showMockMode?: boolean;
  showApiKey?: boolean;
}

const NotionSolutionsSection: React.FC<NotionSolutionsSectionProps> = ({
  showCorsProxy = true,
  showMockMode = true,
  showApiKey = true
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
        <Lightbulb size={14} className="text-amber-500" />
        Solutions possibles
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {showCorsProxy && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                <Workflow size={12} className="text-amber-600" />
                Utiliser le proxy CORS
              </h4>
              <p className="text-xs text-amber-700">
                Vérifiez que le proxy CORS est correctement déployé et accessible.
                Cette étape est nécessaire pour contourner les limitations CORS de l'API Notion.
              </p>
            </CardContent>
          </Card>
        )}

        {showMockMode && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                <Workflow size={12} className="text-amber-600" />
                Activer le mode démonstration
              </h4>
              <p className="text-xs text-amber-700">
                Si vous ne pouvez pas vous connecter à Notion, vous pouvez activer
                le mode démonstration pour tester l'application avec des données fictives.
              </p>
            </CardContent>
          </Card>
        )}

        {showApiKey && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
                <Key size={12} className="text-amber-600" />
                Vérifier votre clé API
              </h4>
              <p className="text-xs text-amber-700">
                Assurez-vous que votre clé API Notion est correcte et que votre intégration
                a les permissions nécessaires sur les bases de données que vous essayez d'utiliser.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotionSolutionsSection;
