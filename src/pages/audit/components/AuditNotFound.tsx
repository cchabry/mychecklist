
import React from 'react';
import { NavigateFunction, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Plus } from 'lucide-react';

interface AuditNotFoundProps {
  navigate: NavigateFunction;
  projectId?: string;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ navigate, projectId }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md text-center p-6 bg-white rounded-lg shadow-md border border-gray-100">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Projet non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Le projet que vous cherchez n'existe pas ou a été supprimé.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
            
            {projectId && (
              <Button 
                variant="default"
                onClick={() => navigate(`/audit/new/${projectId}`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un audit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditNotFound;
