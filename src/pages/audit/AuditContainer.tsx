
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getProjectById, createMockAudit, createNewAudit } from '@/lib/mockData';
import { Audit } from '@/lib/types';
import Header from '@/components/Header';
import AuditHeader from './components/AuditHeader';
import AuditProgress from './components/AuditProgress';
import AuditChecklist from './components/AuditChecklist';
import AuditLoader from './components/AuditLoader';
import AuditNotFound from './components/AuditNotFound';

export const AuditContainer = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(getProjectById(projectId || ''));
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!projectId || !project) {
      toast.error('Projet non trouvé');
      navigate('/');
      return;
    }
    
    // Simuler le chargement de l'audit depuis une API
    const timer = setTimeout(() => {
      const mockAudit = project.progress === 0 
        ? createNewAudit(projectId) 
        : createMockAudit(projectId);
      setAudit(mockAudit);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [projectId, project, navigate]);
  
  const handleSaveAudit = () => {
    toast.success("Audit sauvegardé avec succès", {
      description: "Toutes les modifications ont été enregistrées",
    });
  };
  
  if (loading) {
    return <AuditLoader />;
  }
  
  if (!project || !audit) {
    return <AuditNotFound navigate={navigate} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <main className="flex-1 container px-4 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <AuditHeader 
            project={project} 
            onSave={handleSaveAudit} 
            onBack={() => navigate('/')} 
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
      </main>
      
      <footer className="py-6 border-t border-border/60 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} WebAudit - Audits Qualité Web
        </div>
      </footer>
    </div>
  );
};
