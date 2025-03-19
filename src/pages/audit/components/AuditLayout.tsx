
import React, { ReactNode } from 'react';
import Header from '@/components/Header';

interface AuditLayoutProps {
  children: ReactNode;
  notionConfigOpen?: boolean;
  onNotionConfigClose?: () => void;
  onNotionConfigSuccess?: () => void;
}

const AuditLayout: React.FC<AuditLayoutProps> = ({ 
  children, 
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container max-w-screen-xl mx-auto p-4 md:p-6">
        {children}
      </main>
      
      <footer className="bg-gray-50 border-t py-4">
        <div className="container max-w-screen-xl mx-auto px-4 text-center text-sm text-gray-500">
          Prototype de démonstration - Les données sont fictives
        </div>
      </footer>
    </div>
  );
};

export default AuditLayout;
