
import React from 'react';
import { NotionDatabasesCreator } from '@/components/notion';
import Header from '@/components/Header';

const CreateDatabasesPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-screen-xl">
      <Header />
      
      <main className="container px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Création des bases de données Notion</h1>
        <p className="text-gray-500 mb-8">
          Créez toutes les bases de données nécessaires au fonctionnement de l'application dans votre espace Notion.
        </p>
        
        <NotionDatabasesCreator />
      </main>
    </div>
  );
};

export default CreateDatabasesPage;
