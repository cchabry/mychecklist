
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
      loadProject();
    }
  }, [usingNotion, projectId]);
  
  // Handler pour mettre à jour l'audit
  const handleUpdateAudit = (updatedAudit) => {
    console.log("Updating audit state");
    setAudit(updatedAudit);
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
                <NotionConnectButton 
                  usingNotion={usingNotion} 
                  onClick={handleConnectNotionClick}
                  id="notion-connect-button"
                />
              </div>
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
