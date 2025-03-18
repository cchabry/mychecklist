
import React from 'react';
import { Server } from 'lucide-react';

const NotionProxyConfigSection: React.FC = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
      <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
        <Server size={16} />
        Configuration du proxy Vercel
      </h3>
      <p className="text-sm text-blue-700 mb-3">
        Pour finaliser la configuration et pouvoir utiliser l'API Notion directement:
      </p>
      <ol className="space-y-3 list-decimal pl-5">
        <li className="text-sm">
          Suivez les instructions du fichier README.md pour déployer le projet sur Vercel
        </li>
        <li className="text-sm">
          Une fois déployé, mettez à jour l'URL du proxy dans le fichier notionProxy.ts
        </li>
        <li className="text-sm">
          Redéployez le projet et configurez à nouveau votre connexion Notion
        </li>
      </ol>
      <p className="text-sm mt-3 text-blue-700">
        En attendant, l'application fonctionnera en mode démonstration avec des données de test.
      </p>
    </div>
  );
};

export default NotionProxyConfigSection;
