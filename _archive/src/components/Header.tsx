
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Menu, TestTube, Database, FileCode, Beaker, Settings } from 'lucide-react';
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
import OperationModeControl from './OperationModeControl';

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
          {/* Utilisation de OperationModeControl */}
          <OperationModeControl simplified />
          
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
          
          <Button variant="outline" size="icon" asChild>
            <Link to="/config" className="transition-all duration-300">
              <Settings size={20} />
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
                <Link to="/notion-status" className="flex w-full items-center">
                  <TestTube className="mr-2 h-4 w-4" />
                  <span>Statut Notion</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link to="/docs" className="flex w-full items-center">
                  <FileCode className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setShowTestGenerator(true)}>
                <Beaker className="mr-2 h-4 w-4 text-amber-600" />
                <span>Générer des données de test</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Dialog open={showTestGenerator} onOpenChange={setShowTestGenerator}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Générateur de données de test</DialogTitle>
            <DialogDescription>
              Créez des données de test pour vos projets, audits et évaluations
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <NotionTestDataGenerator onClose={() => setShowTestGenerator(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
