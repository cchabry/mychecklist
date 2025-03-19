
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotionIntegration } from './hooks/useNotionIntegration';
import { useAuditData } from './hooks/useAuditData';
import { toast } from 'sonner';

import AuditLayout from './components/AuditLayout';
import AuditHeader from './components/AuditHeader';
import AuditLoader from './components/AuditLoader';
import AuditNotFound from './components/AuditNotFound';
import AuditProgress from './components/AuditProgress';
import AuditChecklist from './components/AuditChecklist';
import NotionConnectButton from './components/NotionConnectButton';
import { NotionErrorDetails } from '@/components/notion';
import { notionApi } from '@/lib/notionProxy';

export const AuditContainer = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const { 
    usingNotion, 
    notionConfigOpen, 
    notionErrorDetails,
    handleConnectNotionClick, 
    handleNotionConfigSuccess, 
    handleNotionConfigClose,
    hideNotionError
  } = useNotionIntegration();
  
  const { 
    project, 
    audit, 
    loading, 
    notionError,
    setAudit, 
    handleSaveAudit,
    loadProject 
  } = useAuditData(projectId, usingNotion);
  
  // Afficher l'erreur Notion si détectée lors du chargement des données
  useEffect(() => {
    if (notionError) {
      console.log("Showing Notion error from audit data:", notionError);
      // Mettre à jour les détails d'erreur dans le state plutôt que d'appeler hideNotionError
      // pour éviter l'erreur "Cannot update a component while rendering a different component"
    }
  }, [notionError]);
  
  // Recharger les données quand la configuration Notion change
  useEffect(() => {
    if (projectId) {
      console.log("Notion config changed, reloading project data");
      console.log("Current mock mode status:", notionApi.mockMode.isActive() ? "ACTIVE" : "INACTIVE");
      console.log("Using Notion:", usingNotion);
      
      // Réinitialiser complètement l'état du mode mock si Notion est configuré
      if (usingNotion && notionApi.mockMode.isActive()) {
        console.log("Force deactivating mock mode before loading project");
        notionApi.mockMode.deactivate();
        
        // Forcer un rafraîchissement des données en vidant les caches
        localStorage.removeItem('audit_cache');
        localStorage.removeItem('projects_cache');
      }
      
      loadProject();
    }
  }, [usingNotion, projectId]);
  
  // Handler pour mettre à jour l'audit
  const handleUpdateAudit = (updatedAudit) => {
    console.log("Updating audit state");
    setAudit(updatedAudit);
  };
  
  // Force reset de tous les caches
  const handleForceReset = () => {
    console.log("Force resetting all caches from AuditContainer");
    notionApi.mockMode.forceReset();
    
    // Recharger les données après réinitialisation
    setTimeout(() => {
      loadProject();
    }, 600);
  };
  
  return (
    <AuditLayout
      notionConfigOpen={notionConfigOpen}
      onNotionConfigClose={handleNotionConfigClose}
      onNotionConfigSuccess={handleNotionConfigSuccess}
    >
      {loading ? (
        <AuditLoader />
      ) : !project || !audit ? (
        <AuditNotFound navigate={navigate} />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <AuditHeader 
                project={project} 
                onSave={handleSaveAudit} 
                onBack={() => navigate('/')} 
              />
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-red-500"
                  onClick={handleForceReset}
                  title="Forcer l'état réel et réinitialiser tous les caches"
                >
                  <RefreshCw size={16} />
                  Réinitialiser
                </Button>
                
                <NotionConnectButton 
                  usingNotion={usingNotion} 
                  onClick={handleConnectNotionClick}
                  id="notion-connect-button"
                />
              </div>
            </div>
            
            {/* Indicateur de mode mock */}
            {notionApi.mockMode.isActive() && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Mode démonstration actif</span>
                </div>
                <p className="mt-1 text-xs">
                  Les données affichées sont fictives. Pour utiliser les données réelles, cliquez sur "Réinitialiser".
                </p>
              </div>
            )}
            
            <AuditProgress audit={audit} />
          </div>
          
          <AuditChecklist 
            audit={audit} 
            onUpdateAudit={handleUpdateAudit}
          />
        </>
      )}
      
      <NotionErrorDetails
        isOpen={notionErrorDetails.show}
        onClose={hideNotionError}
        error={notionErrorDetails.error}
        context={notionErrorDetails.context}
      />
    </AuditLayout>
  );
};

// N'oubliez pas d'importer les composants requis
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
