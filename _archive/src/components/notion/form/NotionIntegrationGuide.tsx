
import React from 'react';
import { Share2 } from 'lucide-react';

const NotionIntegrationGuide: React.FC = () => {
  return (
    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-md">
      <Share2 size={18} className="flex-shrink-0 mt-0.5 text-amber-500" />
      <div>
        <p className="font-semibold">Important : Connectez votre intégration</p>
        <p className="mt-1">Les bases de données doivent être connectées à votre intégration Notion :</p>
        <ol className="mt-1 space-y-1 list-decimal list-inside">
          <li>Dans Notion, ouvrez votre base de données</li>
          <li>Cliquez sur les <strong>...</strong> (trois points) en haut à droite</li>
          <li>Sélectionnez <strong>Connexions</strong> dans le menu</li>
          <li>Recherchez et ajoutez votre intégration</li>
          <li>Vérifiez que les permissions d'écriture sont activées</li>
        </ol>
      </div>
    </div>
  );
};

export default NotionIntegrationGuide;
