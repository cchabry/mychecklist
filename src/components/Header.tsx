
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
          <img 
            src="/lovable-uploads/466bc6e6-4040-4ea7-a953-45cf731a6d91.png" 
            alt="myChecklist Logo" 
            className="h-8 w-auto" 
          />
          <span className="text-lg font-medium text-tmw-darkgray">myChecklist</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {location.pathname !== "/" && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" className="transition-all duration-300 hover:text-tmw-teal">
                <Home size={20} />
              </Link>
            </Button>
          )}
          
          {location.pathname !== "/new-project" && (
            <Button asChild className="bg-tmw-teal hover:bg-tmw-teal/90 transition-all duration-300">
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
