
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotion } from '@/contexts/NotionContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';

import { 
  AuditChecklist, 
  AuditHeader, 
  AuditLayout, 
  AuditLoader, 
  AuditNotFound, 
  AuditProgress,
  NotionConnectButton 
} from './components';
import { NotionErrorDetails } from '@/components/notion';
import { useAuditData } from './hooks/useAuditData';
import { toast } from 'sonner';

interface AuditContainerProps {
  projectId: string;
}

export const AuditContainer: React.FC<AuditContainerProps> = ({ projectId }) => {
  console.log("AuditContainer rendering with projectId:", projectId);
  
  const navigate = useNavigate();
  const { status, config, usingNotion, testConnection } = useNotion();
  
  // Débogage important - assurons-nous que le projectId est bien là
  console.log("Project ID dans AuditContainer:", projectId);
  
  const [notionConfigOpen, setNotionConfigOpen] = useState(false);
  const [notionErrorDetails, setNotionErrorDetails] = useState({
    show: false,
    error: '',
    context: ''
  });
  
  // Force mock mode activation if we have Notion errors
  useEffect(() => {
    if (status.error && !notionApi.mockMode.isActive()) {
      console.log("⚠️ Activating mock mode due to Notion errors:", status.error);
      notionApi.mockMode.activate();
      toast.info('Mode démonstration activé', {
        description: 'En raison d\'un problème de connexion à Notion, des données fictives sont utilisées'
      });
    }
  }, [status.error]);
  
  const handleConnectNotionClick = () => {
    setNotionConfigOpen(true);
  };
  
  const handleNotionConfigSuccess = () => {
    setNotionConfigOpen(false);
    testConnection();
    
    // Force a reload of the project data
    loadProject();
  };
  
  const handleNotionConfigClose = () => {
    setNotionConfigOpen(false);
  };
  
  const hideNotionError = () => {
    setNotionErrorDetails({
      show: false,
      error: '',
      context: ''
    });
  };
  
  // Utilisation explicite du hook avec le projectId explicitement fourni
  const { 
    project, 
    audit, 
    loading, 
    notionError,
    hasChecklistDb,
    setAudit, 
    handleSaveAudit,
    loadProject 
  } = useAuditData(projectId);
  
  useEffect(() => {
    if (notionError) {
      console.log("Showing Notion error from audit data:", notionError);
    }
  }, [notionError]);
  
  useEffect(() => {
    if (projectId) {
      console.log("Notion config changed, reloading project data");
      console.log("Current mock mode status:", notionApi.mockMode.isActive() ? "ACTIVE" : "INACTIVE");
      console.log("Using Notion:", usingNotion);
      
      if (usingNotion && notionApi.mockMode.isActive()) {
        console.log("Force deactivating mock mode before loading project");
        notionApi.mockMode.deactivate();
        
        localStorage.removeItem('audit_cache');
        localStorage.removeItem('projects_cache');
      }
      
      loadProject();
    }
  }, [usingNotion, projectId, loadProject]);
  
  const handleUpdateAudit = (updatedAudit) => {
    console.log("Updating audit state");
    setAudit(updatedAudit);
  };
  
  const handleForceReset = () => {
    console.log("Force resetting all caches from AuditContainer");
    notionApi.mockMode.forceReset();
    toast.info("Réinitialisation effectuée", {
      description: "Les données vont être rechargées"
    });
    
    setTimeout(() => {
      loadProject();
    }, 600);
  };
  
  // Si le projectId est manquant, afficher un message d'erreur
  if (!projectId) {
    console.error("No projectId provided to AuditContainer");
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur: ID de projet manquant</h2>
          <p className="text-gray-600 mb-4">Impossible d'afficher cet audit sans identifiant de projet.</p>
          <Button onClick={() => navigate('/')}>Retourner à l'accueil</Button>
        </div>
      </div>
    );
  }
  
  console.log("AuditContainer state:", { loading, hasProject: !!project, hasAudit: !!audit });
  
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
