
import React from 'react';
import { CheckCircle } from 'lucide-react';

const NotionSolutionsSection: React.FC = () => {
  return (
    <div className="bg-muted p-4 rounded-md">
      <h3 className="font-medium mb-3">Solutions possibles</h3>
      <ul className="space-y-2 text-sm">
        <li className="flex gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span>Vérifiez que votre clé API commence par "secret_" et est correctement copiée</span>
        </li>
        <li className="flex gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span>Assurez-vous que l'intégration a accès à la base de données (partagez la base avec l'intégration)</span>
        </li>
        <li className="flex gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span>Vérifiez l'ID de base de données dans l'URL Notion</span>
        </li>
        <li className="flex gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span>Vérifiez votre connexion internet</span>
        </li>
      </ul>
    </div>
  );
};

export default NotionSolutionsSection;
