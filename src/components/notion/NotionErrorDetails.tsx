
import React from 'react';
import { XCircle, AlertTriangle, Info, ExternalLink, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import NotionSolutionsSection from './NotionSolutionsSection';
import { notionApi } from '@/lib/notionProxy';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { toast } from 'sonner';
import NotionWriteTestButton from './NotionWriteTestButton';

interface NotionErrorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  context?: string;
}

const NotionErrorDetails: React.FC<NotionErrorDetailsProps> = ({ isOpen, onClose, error, context }) => {
  const isJsonParseError = error?.includes('JSON.parse');
  const isCorsError = error?.includes('CORS') || error?.includes('network');
  const isPermissionError = error?.includes('403') || error?.includes('permission');
  
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
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle size={18} />
            Erreur de connexion à Notion
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mt-1 text-amber-600 font-medium flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            
            {context && (
              <div className="mt-2 text-gray-600 flex items-start gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5" /> 
                <span>{context}</span>
              </div>
            )}
            
            {isPermissionError && (
              <div className="mt-4 bg-red-50 p-3 rounded border border-red-200 text-red-700 text-sm">
                <p className="font-medium">Problème de permissions Notion détecté</p>
                <p className="mt-1 text-xs">Pour résoudre ce problème :</p>
                <ul className="mt-1 text-xs list-disc list-inside space-y-1">
                  <li>Vérifiez que votre intégration a accès à la base de données</li>
                  <li>Assurez-vous que les permissions d'<strong>écriture</strong> sont activées</li>
                  <li>Dans Notion, cliquez sur <strong>Partager</strong> dans votre base de données et ajoutez votre intégration</li>
                </ul>
              </div>
            )}
            
            <div className="mt-6 mb-2">
              <NotionSolutionsSection 
                showCorsProxy={true}
                showMockMode={true}
                showApiKey={true}
              />
            </div>
            
            {/* Section de diagnostic avec test d'écriture */}
            <div className="mt-4 border-t pt-4 border-gray-200">
              <h4 className="text-sm font-medium mb-2">Tests de diagnostic :</h4>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <NotionWriteTestButton onSuccess={() => {
                    // Fermer le dialogue après un test réussi
                    onClose();
                    // Recharger la page
                    setTimeout(() => window.location.reload(), 1000);
                  }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ce test tente d'écrire une donnée temporaire dans votre base de données pour vérifier les permissions.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-2">
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotionErrorDetails;
