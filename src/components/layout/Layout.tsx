
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import { OperationModeIndicator } from '../OperationModeIndicator';

/**
 * Layout principal de l'application
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="fixed top-16 right-4 z-50">
        <OperationModeIndicator />
      </div>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
