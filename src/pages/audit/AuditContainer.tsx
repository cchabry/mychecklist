
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { useAuditData } from '@/hooks/useAuditData';

export const AuditContainer = () => {
  console.log("AuditContainer rendering...");
  const { projectId } = useParams<{ projectId: string }>();
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
  
  // Utilisation explicite du hook avec le projectId actuel
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
    
    setTimeout(() => {
      loadProject();
    }, 600);
  };
  
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
