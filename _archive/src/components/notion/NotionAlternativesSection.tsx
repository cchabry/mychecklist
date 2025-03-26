
import React from 'react';
import { CheckCircle } from 'lucide-react';

const NotionAlternativesSection: React.FC = () => {
  return (
    <div className="bg-green-50 p-4 rounded-md border border-green-200">
      <h3 className="font-medium mb-3 flex items-center gap-2 text-green-700">
        <CheckCircle size={16} />
        Solutions alternatives
      </h3>
      <ul className="space-y-2 text-sm">
        <li className="flex gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span><strong>Temporaire</strong> : Utiliser le mode démonstration avec des données de test</span>
        </li>
        <li className="flex gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span><strong>En cours</strong> : Utiliser le proxy Vercel (voir README.md pour la configuration)</span>
        </li>
        <li className="flex gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span><strong>Alternative</strong> : Utiliser une autre solution de base de données comme Supabase</span>
        </li>
      </ul>
    </div>
  );
};

export default NotionAlternativesSection;
