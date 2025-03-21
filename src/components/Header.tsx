
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Menu, TestTube, Database, FileCode, Beaker } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NotionTestDataGenerator } from '@/components/notion';
import { useState } from 'react';

const Header: React.FC = () => {
  const location = useLocation();
  const [showTestGenerator, setShowTestGenerator] = useState(false);
  
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
          
          <Button 
            variant="outline" 
            size="icon" 
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={() => setShowTestGenerator(true)}
            title="Générer des données de test"
          >
            <Beaker size={20} />
          </Button>
          
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
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => setShowTestGenerator(true)}
              >
                <Beaker size={16} />
                <span>Générer données de test</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
      
      {/* Dialog pour le générateur de données de test */}
      <Dialog open={showTestGenerator} onOpenChange={setShowTestGenerator}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Générateur de données de test Notion</DialogTitle>
            <DialogDescription>
              Création et insertion des données de test dans les bases de données Notion
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <NotionTestDataGenerator onClose={() => setShowTestGenerator(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
