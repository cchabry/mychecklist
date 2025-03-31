
import { ReactNode } from 'react';
import { OperationModeIndicator } from '../OperationModeIndicator';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Layout principal de l'application
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b py-2 px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Audit Qualité Web</h1>
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
