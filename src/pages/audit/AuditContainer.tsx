
import React, { useState, useEffect, useRef } from 'react';
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
import MockModeSelector from '@/components/notion/MockModeSelector';
import { useAuditData } from './hooks/useAuditData';
import { toast } from 'sonner';

interface AuditContainerProps {
  projectId: string;
  onError?: (error: any) => void;
}

export const AuditContainer: React.FC<AuditContainerProps> = ({ projectId, onError }) => {
  console.log("AuditContainer rendering with projectId:", projectId);
  
  const mockModeActivated = useRef(false);
  
  useEffect(() => {
    if (!mockModeActivated.current && !notionApi.mockMode.isActive()) {
      console.log("Activation du mode démo pour le prototype");
      notionApi.mockMode.activateV2(); // Activer V2 par défaut
      mockModeActivated.current = true;
    }
  }, []);
  
  const navigate = useNavigate();
  const { status, config, usingNotion, testConnection } = useNotion();
  
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
  
  const dataInitialized = useRef(false);
  
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
      if (onError) {
        onError(notionError);
      }
    }
  }, [notionError, onError]);
  
  useEffect(() => {
    if (projectId && !dataInitialized.current) {
      console.log("Loading project data");
      loadProject();
      dataInitialized.current = true;
    }
  }, [projectId, loadProject]);
  
  const handleUpdateAudit = (updatedAudit) => {
    console.log("Updating audit state");
    setAudit(updatedAudit);
  };
  
  const handleForceReset = () => {
    console.log("Force resetting all caches from AuditContainer");
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    
    toast.info("Réinitialisation effectuée", {
      description: "Les données vont être rechargées"
    });
    
    dataInitialized.current = false;
    
    setTimeout(() => {
      loadProject();
    }, 600);
  };
  
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
                  title="Réinitialiser les données du prototype"
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
            
            <div className="mb-4">
              <MockModeSelector />
            </div>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="font-medium">Mode prototype actif</span>
              </div>
              <p className="mt-1 text-xs">
                Les données affichées sont fictives et uniquement destinées à la démonstration du prototype.
              </p>
            </div>
            
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
