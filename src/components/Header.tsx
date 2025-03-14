
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Plus } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="w-full bg-white/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 transition-all duration-300">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-opacity duration-300 hover:opacity-80"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-medium">WebAudit</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {location.pathname !== "/" && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" className="transition-all duration-300 hover:text-primary">
                <Home size={20} />
              </Link>
            </Button>
          )}
          
          {location.pathname !== "/new-project" && (
            <Button asChild className="transition-all duration-300 hover:opacity-90">
              <Link to="/new-project">
                <Plus size={16} className="mr-2" />
                Nouveau projet
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
