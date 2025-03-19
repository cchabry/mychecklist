
import React from 'react';
import { ExternalLink, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialogAction } from '@/components/ui/alert-dialog';
import { notionApi } from '@/lib/notionProxy';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { toast } from 'sonner';

interface ErrorActionsProps {
  onClose: () => void;
}

const ErrorActions: React.FC<ErrorActionsProps> = ({ onClose }) => {
  const handleForceRealMode = () => {
    // Forcer le mode réel de façon plus agressive
    console.log('🔄 Forçage COMPLET du mode réel et suppression des caches');
    
    // Nettoyage approfondi du localStorage pour Notion
    localStorage.removeItem('notion_last_error');
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.setItem('notion_force_real', 'true');
    
    // Force real mode et nettoie tous les caches
    notionApi.mockMode.forceReset();
    
    // Notification explicite
    toast.success('Mode réel forcé', {
      description: 'Toutes les données en cache ont été supprimées. L\'application utilisera les données réelles de Notion.',
      duration: 5000,
    });
    
    // Ferme le dialogue
    onClose();
    
    // Recharge la page pour appliquer les changements
    setTimeout(() => window.location.reload(), 500);
  };
  
  return (
    <div className="sm:justify-between flex flex-col sm:flex-row gap-2">
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            window.open('https://github.com/cedcoss-upasana/my-checklist/issues', '_blank');
          }}
          className="gap-1 text-xs"
        >
          <ExternalLink size={12} />
          Signaler un bug
        </Button>
        
        <Button
          size="sm"
          variant="secondary"
          onClick={handleForceRealMode}
          className="gap-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 border border-green-300"
        >
          <Database size={12} />
          Forcer mode réel
        </Button>
      </div>
      <AlertDialogAction>Fermer</AlertDialogAction>
    </div>
  );
};

export default ErrorActions;
