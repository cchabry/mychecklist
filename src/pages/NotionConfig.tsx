import React, { useState } from 'react';
import Header from '@/components/Header';
import { NotionConfig as NotionConfigComponent } from '@/components/notion';

const NotionConfigPage: React.FC = () => {
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleClose = () => {
    setIsConfigOpen(false);
    // Rediriger vers la page d'accueil
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <NotionConfigComponent />
      </main>
    </div>
  );
};

export default NotionConfigPage;
