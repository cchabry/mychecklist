
import React from 'react';
import { Globe, Server, Shield, Zap } from 'lucide-react';

const NotionFetchErrorSection: React.FC = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
      <h3 className="font-medium mb-3 flex items-center gap-2 text-blue-700">
        <Shield size={16} />
        Pourquoi ce problème se produit
      </h3>
      <p className="text-sm text-blue-700 mb-3">
        L'erreur "Failed to fetch" est causée par des restrictions de sécurité du navigateur (CORS) qui empêchent l'accès direct à l'API Notion. <strong>Ce n'est pas lié au type d'intégration Notion (interne ou public).</strong>
      </p>
      <div className="space-y-3">
        <div className="flex gap-2 items-start">
          <Globe size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm">Les applications frontend ne peuvent pas accéder directement à l'API Notion depuis le navigateur</span>
        </div>
        <div className="flex gap-2 items-start">
          <Server size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm">La solution idéale nécessite un serveur intermédiaire (proxy) qui fait les appels à l'API Notion</span>
        </div>
        <div className="flex gap-2 items-start">
          <Zap size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm">Pour cette application, nous utilisons Vercel Functions comme proxy</span>
        </div>
      </div>
    </div>
  );
};

export default NotionFetchErrorSection;
