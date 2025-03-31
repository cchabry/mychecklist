
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

const AuditLoader: React.FC = () => {
  const [showLongLoadingMessage, setShowLongLoadingMessage] = useState(false);
  
  // Afficher un message supplémentaire si le chargement prend plus de 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLongLoadingMessage(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground mb-2">Chargement de l'audit...</p>
          
          {showLongLoadingMessage && (
            <div className="mt-4 max-w-md text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
              <p className="font-medium mb-1">Le chargement prend plus de temps que prévu</p>
              <p>Si le problème persiste, essayez de cliquer sur "Réinitialiser" une fois la page chargée, ou retournez à l'accueil et réessayez.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLoader;
