
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cloud, Database } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

interface MockModeToggleProps {
  onToggle?: (isMockMode: boolean) => void;
}

const MockModeToggle = ({ onToggle }: MockModeToggleProps = {}) => {
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial du mode mock
    const mockModeActive = notionApi.mockMode.isActive();
    setIsMockMode(mockModeActive);
  }, []);

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
    <div className="flex items-center space-x-2">
      <Database size={16} className={!isMockMode ? "text-tmw-teal" : "text-gray-400"} />
      
      <Switch 
        id="mock-mode" 
        checked={isMockMode}
        onCheckedChange={handleToggle}
      />
      
      <Label htmlFor="mock-mode" className="flex gap-2 items-center cursor-pointer text-sm">
        <Cloud size={16} className={isMockMode ? "text-blue-500" : "text-gray-400"} />
        {isMockMode ? "Mode démo" : "Mode réel"}
      </Label>
    </div>
  );
};

export default MockModeToggle;
