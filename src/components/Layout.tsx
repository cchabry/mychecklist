
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './Navbar';
import { OperationModeIndicator } from './OperationModeIndicator';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="fixed top-16 right-4 z-50">
        <OperationModeIndicator />
      </div>
      <main className="flex-1 bg-tertiary/20">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default Layout;
