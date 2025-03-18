
import React from 'react';
import { useParams } from 'react-router-dom';
import { useNotionIntegration } from './hooks/useNotionIntegration';
import { useAuditData } from './hooks/useAuditData';

import AuditLayout from './components/AuditLayout';
import AuditHeader from './components/AuditHeader';
import AuditLoader from './components/AuditLoader';
import AuditNotFound from './components/AuditNotFound';
import AuditProgress from './components/AuditProgress';
import AuditChecklist from './components/AuditChecklist';
import NotionConnectButton from './components/NotionConnectButton';
import NotionErrorDetails from '@/components/NotionErrorDetails';

export const AuditContainer = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
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
    handleSaveAudit 
  } = useAuditData(projectId, usingNotion);
  
  // Afficher l'erreur Notion si détectée lors du chargement des données
  React.useEffect(() => {
    if (notionError) {
      hideNotionError(); // Réinitialiser l'état précédent
      setTimeout(() => {
        hideNotionError(); // Masquer la notification après un délai
      }, 10000);
    }
  }, [notionError]);
  
  return (
    <AuditLayout
      notionConfigOpen={notionConfigOpen}
      onNotionConfigClose={handleNotionConfigClose}
      onNotionConfigSuccess={handleNotionConfigSuccess}
    >
      {loading ? (
        <AuditLoader />
      ) : !project || !audit ? (
        <AuditNotFound />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <AuditHeader 
                project={project} 
                audit={audit} 
                onSave={handleSaveAudit} 
              />
              
              <div className="flex items-center gap-4">
                <NotionConnectButton 
                  usingNotion={usingNotion} 
                  onClick={handleConnectNotionClick}
                />
              </div>
            </div>
            
            <AuditProgress audit={audit} />
          </div>
          
          <AuditChecklist 
            audit={audit} 
            onAuditChange={setAudit} 
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
