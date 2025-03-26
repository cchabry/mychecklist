
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-semibold">Application d'Audit</h1>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      <footer className="py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Application d'Audit
        </div>
      </footer>
    </div>
  );
};

export default Layout;
