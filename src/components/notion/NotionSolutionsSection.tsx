
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type NotionSolutionsSectionProps = {
  errorCode?: string;
};

const NotionSolutionsSection: React.FC<NotionSolutionsSectionProps> = ({ errorCode }) => {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Solutions possibles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorCode === '401' && (
          <Alert variant="outline" className="border-amber-200 bg-amber-50/50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              Erreur d'authentification. Vérifiez votre clé API Notion et assurez-vous qu'elle est valide.
            </AlertDescription>
          </Alert>
        )}
        
        {errorCode === '403' && (
          <Alert variant="outline" className="border-amber-200 bg-amber-50/50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              Erreur de permission. Assurez-vous que votre intégration Notion a accès aux bases de données nécessaires.
            </AlertDescription>
          </Alert>
        )}
        
        {errorCode === '404' && (
          <Alert variant="outline" className="border-amber-200 bg-amber-50/50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              Base de données ou ressource non trouvée. Vérifiez l'ID de votre base de données Notion.
            </AlertDescription>
          </Alert>
        )}
        
        {(!errorCode || !['401', '403', '404'].includes(errorCode)) && (
          <Alert variant="outline" className="border-amber-200 bg-amber-50/50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              Vérifiez votre connexion internet et assurez-vous que le proxy CORS est correctement configuré.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm space-y-2">
          <p className="font-medium">Actions recommandées :</p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
            <li>Vérifiez votre configuration Notion (clé API et ID de base de données)</li>
            <li>Assurez-vous que le proxy CORS est correctement déployé</li>
            <li>Vérifiez les autorisations de votre intégration Notion</li>
            <li>Consultez les logs pour plus de détails sur l'erreur</li>
          </ul>
        </div>
        
        <div className="pt-2">
          <a 
            href="https://developers.notion.com/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink size={14} />
            Documentation Notion API
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotionSolutionsSection;
