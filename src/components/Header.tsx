
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Database, 
  BookOpen, 
  Home, 
  Plus, 
  Settings, 
  AlertTriangle, 
  XCircle, 
  Info, 
  DatabaseIcon
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useOperationMode } from '@/services/operationMode';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from './ui/dialog';

const Header = () => {
  const navigate = useNavigate();
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const { isDemoMode, enableRealMode, enableDemoMode } = useOperationMode();

  const handleNavigateTo = (path: string) => {
    navigate(path);
  };

  const toggleDemoMode = () => {
    if (isDemoMode) {
      enableRealMode();
      toast.success('Mode réel activé');
    } else {
      enableDemoMode('Activé manuellement via l\'interface');
      toast.success('Mode démonstration activé');
    }
  };

  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="container mx-auto flex flex-wrap justify-between items-center px-4 py-3">
        {/* Logo et titre */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Database size={24} className="text-primary" />
            <h1 className="text-xl font-bold">AccessScan</h1>
          </Link>
          <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
            Beta
          </span>
        </div>
        
        {/* Navigation principale */}
        <nav className="hidden md:flex items-center space-x-1 flex-grow justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-primary hover:bg-slate-700"
            onClick={() => handleNavigateTo('/')}
          >
            <Home size={18} className="mr-1" />
            Dashboard
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-primary hover:bg-slate-700"
            onClick={() => handleNavigateTo('/new-project')}
          >
            <Plus size={18} className="mr-1" />
            Nouveau projet
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-primary hover:bg-slate-700"
            onClick={() => handleNavigateTo('/checklist')}
          >
            <BookOpen size={18} className="mr-1" />
            Checklist
          </Button>
        </nav>
        
        {/* Boutons de configuration */}
        <div className="flex items-center space-x-2">
          <Button 
            variant={isDemoMode ? "default" : "outline"} 
            size="sm" 
            className={isDemoMode ? "bg-amber-600 hover:bg-amber-700" : "text-gray-300 border-gray-600 hover:text-white"}
            onClick={toggleDemoMode}
          >
            {isDemoMode ? 'Mode démo actif' : 'Mode réel'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-primary hover:bg-slate-700"
            onClick={() => handleNavigateTo('/config')}
          >
            <Settings size={18} />
          </Button>
        </div>
      </div>
      
      {/* Dialogue d'information simplifiée */}
      <Dialog open={showVersionInfo} onOpenChange={setShowVersionInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Information sur l'application</DialogTitle>
            <DialogDescription>
              Version Beta
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Fonctionnalités incluses:</p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Système de gestion des modes de fonctionnement</li>
                <li>Test d'écriture Notion fonctionnel</li>
                <li>Interface améliorée et plus informative</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowVersionInfo(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
