
import React from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { OperationModeIndicator } from '@/components/OperationModeIndicator';

/**
 * Layout pour les pages de projet
 */
export const ProjectLayout = () => {
  const { projectId } = useParams();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/" className="text-primary hover:text-primary/80">
                Accueil
              </Link>
              <span>/</span>
              <h1 className="text-xl font-bold">Projet</h1>
            </div>
            <div className="fixed top-4 right-4 z-50">
              <OperationModeIndicator />
            </div>
          </div>
          <nav className="flex mt-2 gap-4">
            <Link 
              to={`/projects/${projectId}`} 
              className="text-sm hover:text-primary"
            >
              Détails
            </Link>
            <Link 
              to={`/projects/${projectId}/exigences`} 
              className="text-sm hover:text-primary"
            >
              Exigences
            </Link>
            <Link 
              to={`/projects/${projectId}/audits`} 
              className="text-sm hover:text-primary"
            >
              Audits
            </Link>
            <Link 
              to={`/projects/${projectId}/actions`} 
              className="text-sm hover:text-primary"
            >
              Actions
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};
