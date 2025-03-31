
import { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OperationModeIndicator } from '../OperationModeIndicator';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface ProjectLayoutProps {
  children: ReactNode;
}

/**
 * Layout pour les pages de projet
 */
export function ProjectLayout({ children }: ProjectLayoutProps) {
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-2 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Projet #{projectId?.substring(0, 6)}</h1>
        </div>
        <OperationModeIndicator />
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
      <footer className="bg-gray-50 border-t py-2 px-4 text-center text-sm text-gray-500">
        Outil d'audit qualité web - Mode démonstration
      </footer>
    </div>
  );
}
