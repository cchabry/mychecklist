
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
