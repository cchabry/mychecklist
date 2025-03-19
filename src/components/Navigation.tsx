
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Settings, Database, Plus } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="w-full bg-white/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 transition-all duration-300">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link 
          to="/" 
          className="flex items-center space-x-2 transition-opacity duration-300 hover:opacity-80"
        >
          <img 
            src="lovable-uploads/34e56f4c-c4dc-4d50-b4f8-6a3781d5afbd.png" 
            alt="myChecklist Logo" 
            className="h-8 w-auto" 
          />
          <span className="text-lg font-medium text-tmw-darkgray">myChecklist</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild className={location.pathname === "/" ? "bg-secondary" : ""}>
            <Link to="/" className="flex items-center gap-1.5">
              <Home size={16} />
              <span>Accueil</span>
            </Link>
          </Button>
          
          <Button variant="ghost" size="sm" asChild className={location.pathname === "/notion-settings" ? "bg-secondary" : ""}>
            <Link to="/notion-settings" className="flex items-center gap-1.5">
              <Database size={16} />
              <span>Notion</span>
            </Link>
          </Button>
          
          <Button asChild className="bg-tmw-teal hover:bg-tmw-teal/90 ml-2">
            <Link to="/new-project" className="flex items-center gap-1.5">
              <Plus size={16} />
              <span>Nouveau projet</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
