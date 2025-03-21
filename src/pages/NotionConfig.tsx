
import React from 'react';
import Header from '@/components/Header';
import NotionConfig from '@/components/notion/NotionConfig';

const NotionConfigPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <NotionConfig />
      </main>
    </div>
  );
};

export default NotionConfigPage;
