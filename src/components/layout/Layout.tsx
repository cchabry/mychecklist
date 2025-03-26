
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import NotionConfigRedirect from './NotionConfigRedirect';

/**
 * Layout principal de l'application
 */
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="flex h-screen flex-col">
      <NotionConfigRedirect />
      
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-auto bg-gray-50/90">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
