
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Add useNavigate import
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
  const navigate = useNavigate(); // Add navigate hook
  
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
        <AuditNotFound navigate={navigate} /> // Pass the navigate prop
      ) : (
        <>
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <AuditHeader 
                project={project} 
                onSave={handleSaveAudit} 
                onBack={() => navigate('/')} // Add onBack prop
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
            onUpdateAudit={setAudit} // Rename onAuditChange to onUpdateAudit
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
