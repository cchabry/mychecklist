
import React from 'react';
import { AlertCircle, Code, ExternalLink } from 'lucide-react';

interface NotionSolutionsSectionProps {
  errorType?: string;
  showApiKey?: boolean;
  showCorsProxy?: boolean;
  showMockMode?: boolean;
}

const NotionSolutionsSection: React.FC<NotionSolutionsSectionProps> = ({ 
  errorType,
  showApiKey = false,
  showCorsProxy = false,
  showMockMode = false
}) => {
  return (
    <div className="mt-4 border rounded-md p-4 bg-blue-50 border-blue-200">
      <h3 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
        <AlertCircle size={16} />
        Solutions recommandées
      </h3>
      
      <div className="space-y-2 text-sm">
        {errorType === 'auth' && (
          <>
            <p>Problème d'authentification détecté. Essayez de :</p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-blue-700">
              <li>Vérifier que votre clé d'API est correcte</li>
              <li>Régénérer une nouvelle clé d'API dans Notion</li>
            </ul>
          </>
        )}
        
        {errorType === 'permission' && (
          <>
            <p>Problème de permissions détecté. Essayez de :</p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-blue-700">
              <li>Vérifier que votre intégration a accès à la base de données</li>
              <li>Ajouter l'intégration à la base de données depuis Notion</li>
            </ul>
          </>
        )}
        
        {showCorsProxy && (
          <div className="mt-3">
            <p className="font-medium">Utiliser un proxy CORS:</p>
            <p className="text-blue-700">
              Si vous rencontrez des erreurs CORS, activez l'option de proxy dans les paramètres.
            </p>
          </div>
        )}
        
        {showApiKey && (
          <div className="mt-3">
            <p className="font-medium">Vérifier la clé API:</p>
            <p className="text-blue-700">
              Assurez-vous que votre clé d'API est correcte et que l'intégration a les permissions nécessaires.
            </p>
          </div>
        )}
        
        {showMockMode && (
          <div className="mt-3">
            <p className="font-medium">Activer le mode démonstration:</p>
            <p className="text-blue-700">
              Pour tester l'application sans connexion à Notion, activez le mode démonstration.
            </p>
          </div>
        )}
        
        {(!errorType || errorType === 'network' || errorType === 'cors') && (
          <>
            <p>Problème de connexion détecté. Essayez de :</p>
            <ul className="list-disc list-inside pl-2 space-y-1 text-blue-700">
              <li>Vérifier votre connexion internet</li>
              <li>Activer le mode de démonstration temporairement</li>
              <li>Utiliser un proxy CORS pour les requêtes</li>
            </ul>
            
            <div className="flex items-center gap-2 mt-2">
              <Code size={14} className="text-blue-500" />
              <a 
                href="https://developers.notion.com/docs/getting-started" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                Documentation Notion <ExternalLink size={12} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotionSolutionsSection;
