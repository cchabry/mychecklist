
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

type MainLayoutProps = {
  children?: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl">Audit Checklist</Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              Projets
            </Link>
            <Link to="/checklist" className="text-sm font-medium hover:text-primary">
              Référentiel
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children || <Outlet />}
      </main>
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Audit Checklist
        </div>
      </footer>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default MainLayout;
