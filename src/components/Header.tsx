
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Menu, TestTube, Database, FileCode } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="w-full bg-[#eeeeee]/90 backdrop-blur-lg border-b border-border sticky top-0 z-10 transition-all duration-300">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link 
          to="/" 
          className="flex items-center transition-opacity duration-300 hover:opacity-80"
        >
          <img 
            src="/lovable-uploads/466bc6e6-4040-4ea7-a953-45cf731a6d91.png" 
            alt="myChecklist Logo" 
            className="h-8 w-auto" 
          />
        </Link>
        
        <div className="flex items-center space-x-4">
          {location.pathname !== "/" && (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/" className="transition-all duration-300 hover:text-tmw-teal">
                <Home size={20} />
              </Link>
            </Button>
          )}
          
          <Button variant="outline" size="icon" asChild>
            <Link to="/create-databases" className="transition-all duration-300">
              <Database size={20} />
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/diagnostics" className="flex items-center gap-2">
                  <TestTube size={16} />
                  <span>Diagnostics Notion</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/create-databases" className="flex items-center gap-2">
                  <Database size={16} />
                  <span>Créer les 8 BDD</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center gap-2" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('notion-config-button')?.click();
                }}>
                  <Database size={16} />
                  <span>Configurer Notion</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a 
                  href="/scriptsNotion.md" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2"
                >
                  <FileCode size={16} />
                  <span>Documentation Script Notion</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
