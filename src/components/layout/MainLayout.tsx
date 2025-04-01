
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

/**
 * Layout principal de l'application
 */
export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-tertiary/20">
        <Outlet />
      </main>
      <footer className="bg-gray-50 border-t py-2 px-4 text-center text-sm text-gray-500">
        Outil d'audit qualité web
      </footer>
    </div>
  );
}
