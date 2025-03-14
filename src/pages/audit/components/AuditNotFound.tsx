
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

interface AuditNotFoundProps {
  navigate: NavigateFunction;
}

const AuditNotFound: React.FC<AuditNotFoundProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Projet non trouvé</h2>
          <p className="text-muted-foreground mb-6">
            Le projet que vous cherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuditNotFound;
