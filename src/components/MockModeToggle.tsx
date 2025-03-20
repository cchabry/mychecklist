
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cloud, Database, AlertCircle } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MockModeToggleProps {
  onToggle?: (isMockMode: boolean) => void;
}

const MockModeToggle = ({ onToggle }: MockModeToggleProps = {}) => {
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial du mode mock
    const mockModeActive = notionApi.mockMode.isActive();
    setIsMockMode(mockModeActive);
    
    // Vérifier régulièrement l'état du mode mock
    const interval = setInterval(() => {
      const currentMockState = notionApi.mockMode.isActive();
      if (currentMockState !== isMockMode) {
        setIsMockMode(currentMockState);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isMockMode]);

  const handleToggle = (checked: boolean) => {
    setIsMockMode(checked);
    
    if (checked) {
      notionApi.mockMode.activate();
      toast.info('Mode démonstration activé', {
        description: 'L\'application utilise maintenant des données fictives',
      });
      
      // Forcer l'effacement des caches lors du passage en mode mock
      localStorage.removeItem('projects_cache');
      localStorage.removeItem('audit_cache');
    } else {
      notionApi.mockMode.deactivate();
      toast.success('Mode réel activé', {
        description: 'L\'application utilise maintenant les données réelles de Notion',
      });
      
      // Forcer l'effacement des caches lors du passage en mode réel
      localStorage.removeItem('projects_cache');
      localStorage.removeItem('audit_cache');
    }
    
    // Déclencher le callback si fourni
    if (onToggle) {
      onToggle(checked);
    }
    
    // Rafraîchir la page après un court délai
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 relative">
            <Database size={16} className={!isMockMode ? "text-green-500" : "text-gray-400"} />
            
            <Switch 
              id="mock-mode" 
              checked={isMockMode}
              onCheckedChange={handleToggle}
            />
            
            <Label htmlFor="mock-mode" className="flex gap-2 items-center cursor-pointer text-sm">
              <Cloud size={16} className={isMockMode ? "text-amber-500" : "text-gray-400"} />
              {isMockMode ? (
                <span className="flex items-center gap-1">
                  Mode démo
                  <Badge variant="outline" className="text-[10px] h-4 bg-amber-50 text-amber-700 border-amber-200">v2</Badge>
                </span>
              ) : (
                "Mode réel"
              )}
            </Label>
            
            {isMockMode && (
              <AlertCircle size={12} className="absolute -top-1 -right-1 text-amber-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isMockMode ? 
            "L'application utilise des données fictives (Brief v2)" : 
            "L'application est connectée à l'API Notion"
          }
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MockModeToggle;
