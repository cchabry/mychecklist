
import React from 'react';
import Header from '@/components/Header';

const AuditLoader: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'audit...</p>
        </div>
      </div>
    </div>
  );
};

export default AuditLoader;
