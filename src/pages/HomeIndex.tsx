
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

const HomeIndex = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bienvenue sur myChecklist</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Notion</h2>
          <p className="text-gray-600 mb-4">
            Configurer l'intégration avec Notion pour sauvegarder vos audits
          </p>
          <Link to="/notion-setup">
            <Button className="w-full">
              <Database className="mr-2 h-4 w-4" />
              Configurer Notion
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
          <p className="text-gray-600 mb-4">
            Vérifier l'état de votre connexion avec Notion
          </p>
          <Link to="/diagnostics">
            <Button variant="outline" className="w-full">
              Voir les diagnostics
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeIndex;
