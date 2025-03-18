
import React from 'react';
import { AlertCircle } from 'lucide-react';

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
    <div className="border border-amber-200 bg-amber-50 rounded-md p-3 text-sm">
      <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
        <AlertCircle size={16} className="text-amber-500" />
        Solutions possibles :
      </h3>
      <ul className="space-y-2 text-amber-700">
        {showApiKey && (
          <li>
            • Vérifiez que votre <strong>clé d'API Notion</strong> est correcte et a les permissions suffisantes
          </li>
        )}
        {showCorsProxy && (
          <li>
            • Les restrictions CORS empêchent les appels directs à l'API Notion depuis le navigateur.
            Utilisez le <strong>mode démonstration</strong> ou configurez un proxy CORS.
          </li>
        )}
        {showMockMode && (
          <li>
            • Activez le <strong>mode démonstration</strong> pour utiliser des données simulées pendant
            la résolution du problème.
          </li>
        )}
      </ul>
    </div>
  );
};

export default NotionSolutionsSection;
