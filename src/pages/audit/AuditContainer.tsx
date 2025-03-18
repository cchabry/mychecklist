
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotionIntegration } from './hooks/useNotionIntegration';
import { useAuditData } from './hooks/useAuditData';
import AuditHeader from './components/AuditHeader';
import AuditProgress from './components/AuditProgress';
import AuditChecklist from './components/AuditChecklist';
import AuditLoader from './components/AuditLoader';
import AuditNotFound from './components/AuditNotFound';
import AuditLayout from './components/AuditLayout';
import NotionConnectButton from './components/NotionConnectButton';

export const AuditContainer = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // Custom hooks
  const {
    usingNotion,
    notionConfigOpen,
    handleConnectNotionClick,
    handleNotionConfigSuccess,
    handleNotionConfigClose
  } = useNotionIntegration();
  
  const {
    project,
    audit,
    loading,
    setAudit,
    handleSaveAudit
  } = useAuditData(projectId, usingNotion);
  
  if (loading) {
    return <AuditLoader />;
  }
  
  if (!project || !audit) {
    return <AuditNotFound navigate={navigate} />;
  }
  
  return (
    <AuditLayout
      notionConfigOpen={notionConfigOpen}
      onNotionConfigClose={handleNotionConfigClose}
      onNotionConfigSuccess={handleNotionConfigSuccess}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6"
      >
        <AuditHeader 
          project={project} 
          onSave={handleSaveAudit} 
          onBack={() => navigate('/')} 
        />
        
        <NotionConnectButton 
          usingNotion={usingNotion}
          onClick={handleConnectNotionClick}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <AuditProgress audit={audit} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <AuditChecklist 
          audit={audit}
          onUpdateAudit={setAudit}
        />
      </motion.div>
    </AuditLayout>
  );
};
