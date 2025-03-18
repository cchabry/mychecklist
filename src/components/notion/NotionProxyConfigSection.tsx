
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
          Vérifiez que le fichier vercel.json contient bien des "rewrites" (et non des "routes")
        </li>
        <li className="text-sm">
          Assurez-vous que le proxy est correctement déployé sur Vercel (vérifiez les logs dans le dashboard Vercel)
        </li>
        <li className="text-sm">
          Testez le point de terminaison /api/ping pour confirmer que les fonctions serverless fonctionnent
        </li>
        <li className="text-sm">
          L'URL du proxy doit correspondre au domaine de votre application déployée + /api/notion-proxy
        </li>
      </ol>
      <p className="text-sm mt-3 text-blue-700">
        En attendant, l'application fonctionnera en mode démonstration avec des données de test.
      </p>
    </div>
  );
};

export default NotionProxyConfigSection;
